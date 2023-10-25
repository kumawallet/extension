import { useLoading } from '@src/hooks';
import { isInPopup } from '@src/utils/utils';
import { SuperToken } from '@superfluid-finance/sdk-core';
import { useQuery } from '@tanstack/react-query';
import { utils } from 'ethers';
import request, { gql } from 'graphql-request';
import { FC, useEffect, useRef, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, Label, ResponsiveContainer } from 'recharts';

const _data = [{
  name: 'Page A',
  uv: 4000,
  pv: 2400,
  amt: 2400,
},
{
  name: 'Page B',
  uv: 3000,
  pv: 1398,
  amt: 2210,
},
{
  name: 'Page C',
  uv: 2000,
  pv: 9800,
  amt: 2290,
},
{
  name: 'Page D',
  uv: 2780,
  pv: 3908,
  amt: 2000,
},
{
  name: 'Page E',
  uv: 1890,
  pv: 4800,
  amt: 2181,
},
{
  name: 'Page F',
  uv: 2390,
  pv: 3800,
  amt: 2500,
},
{
  name: 'Page G',
  uv: 3490,
  pv: 4300,
  amt: 2100,
},];
interface PriceHistory {
  blockTimestamp: string;
  token0Price: number;
}

const aqueductdata = gql`
query {
  syncs(first: 500) {
    id
    reserve0
    reserve1
    blockTimestamp
  }
}
`
enum PERIOD {
  '1H' = '1H',
  '1D' = '1D',
  '1W' = '1W',
  '1M' = '1M',
  '1Y' = '1Y'
}

interface PriceChartProps {
  startDate: string
  token1: SuperToken
  token1Name: string
  token2: SuperToken
  token2Name: string
  currentPrice: number
}

const currentDate = new Date();

const totalPeriod = new Date(currentDate.getFullYear() - 1, currentDate.getMonth()).getTime();

const timePeriodOptions: { [key: string]: number } = {
  [PERIOD['1H']]: currentDate.getTime() - (60 * 60 * 1000),
  [PERIOD['1D']]: currentDate.getTime() - (24 * 60 * 60 * 1000),
  [PERIOD['1W']]: currentDate.getTime() - (7 * 24 * 60 * 60 * 1000),
  [PERIOD['1M']]: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1).getTime(),
  [PERIOD['1Y']]: totalPeriod,
};

const CustomTooltip = ({ payload, tokenName }: { payload: any, tokenName: string }) => {
  return (
    <div className="bg-white/5 rounded-xl">
      <div>
        {payload?.map((pld: { fill: any; value: number; }, index: number) => (
          // eslint-disable-next-line react/jsx-key
          <div className="flex flex-col whitespace-nowrap" style={{ display: "inline-block", padding: 10 }}>
            <p style={{ color: pld.fill }}>{pld.value.toFixed(5)}  {tokenName}</p>
            <p style={{ color: "rgb(255 255 255 / 0.5)" }}>{payload[index].payload.blockTimestamp.toString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};


export const PriceChart: FC<PriceChartProps> = ({
  startDate,
  token1,
  token1Name,
  token2,
  token2Name,
  currentPrice
}) => {
  const { isLoading, starLoading, endLoading } = useLoading(true)

  const height = isInPopup() ? 200 : 400
  const periodSelect = useRef<PERIOD>(PERIOD['1Y']);
  const minDifferenceRef = useRef(Infinity);

  const closestDateRef = useRef<number | null>(null);
  const { data } = useQuery({
    queryKey: ['films'],
    queryFn: async () =>
      request(
        'https://api.studio.thegraph.com/query/49133/aqueductsubgraph/version/latest',
        aqueductdata,
        // variables are type-checked too!
        { first: 10 },
      ),
  })
  const [priceHistory, setConvertedData] = useState<PriceHistory[]>([]);


  useEffect(() => {

    if (!data || !startDate || currentPrice === 0) return


    const currentDate = new Date();

    closestDateRef.current = null;
    minDifferenceRef.current = Infinity;

    starLoading()
    try {
      let currentIndex = -1;
      const newConvertedData: PriceHistory[] = [];


      const sortedSyncs = [...data.syncs].sort((a, b) => {
        const dateA = new Date(a.blockTimestamp * 1000);
        const dateB = new Date(b.blockTimestamp * 1000);
        return dateA.getTime() - dateB.getTime();
      });


      sortedSyncs.forEach((item: {
        blockTimestamp: any;
        reserve0: { toString: () => string };
        reserve1: { toString: () => string };
      }) => {
        currentIndex++
        const blockTimestamp = new Date(item.blockTimestamp * 1000);

        const formattedDate = blockTimestamp.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true
        });

        if (blockTimestamp.getTime() >= timePeriodOptions[periodSelect.current]) {

          const formattedStartDate = Math.floor(new Date(startDate).getTime() / 1000).toString();

          if (item.blockTimestamp === formattedStartDate) {
            closestDateRef.current = currentIndex;
          }

          const convertedItem: PriceHistory = {
            ...item,
            blockTimestamp: formattedDate,
            token0Price: parseFloat(utils.formatEther(item.reserve1.toString())) / parseFloat(utils.formatEther(item.reserve0.toString())),
          };

          newConvertedData.push(convertedItem);
        }
      });

      const formattedCurrentDate = currentDate.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });

      const currentPriceData = { blockTimestamp: formattedCurrentDate, token0Price: currentPrice }

      newConvertedData.push(currentPriceData)

      newConvertedData.sort((a, b) => {
        const dateA = new Date(a.blockTimestamp);
        const dateB = new Date(b.blockTimestamp);
        return dateA.getTime() - dateB.getTime();
      });

      setConvertedData(newConvertedData);

    } catch (error) {
      console.log(error)
    }


  }, [data, startDate, periodSelect.current, currentPrice])

  const type = "monotone";

  const prices = priceHistory.map((item) => item.token0Price);

  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const entry = closestDateRef?.current

  const actualEntry = entry || 0;

  const minExtra = minPrice * .5;
  const maxExtra = maxPrice * .5;

  const swapStartDisplay = 100 - ((priceHistory.length - actualEntry - 1) / (priceHistory.length - 1)) * 100;


  return (
    <>
      <div className='w-min whitespace-nowrap flex items-center justify-center rounded-xl p-2 px-4bg-white/5 text-white/50 space-x-2 font-medium'>
        <p>{`1 ${token1Name || ""} = ${currentPrice} ${token2Name || ""}`}</p>
      </div>

      <ResponsiveContainer width="100%"
        height={height}>
        {
          priceHistory.length > 0 ? (
            <LineChart
              width={800}
              height={400}
              data={priceHistory}
              margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
            >
              <defs>
                <linearGradient id="graph" x1="0" y1="0" x2="100%" y2="0">
                  <stop offset="0%" stopColor="#17203D" />
                  <stop offset={`${swapStartDisplay}%`} stopColor="#17203D" />
                  <stop offset={`${swapStartDisplay}%`} stopColor="#5783F3" />
                  <stop offset="100%" stopColor="#5783F3" />
                </linearGradient>
              </defs>
              <Line
                type={type}
                dataKey="token0Price"
                stroke={`${swapStartDisplay === Infinity ? "#5783F3" : "url(#graph)"}`}
                dot={false}
                strokeWidth="2px"
              />
              {entry && (
                <ReferenceLine
                  x={actualEntry}
                  stroke="rgb(255 255 255 / 0.15)"
                  strokeWidth="2px"
                  strokeDasharray="3 3"
                >
                  <Label
                    stroke="rgb(255 255 255 / 0.15)"
                    value="Entry"
                    position="bottom"
                    offset={10}
                  />
                </ReferenceLine>
              )}
              <XAxis dataKey="blockTimestamp.getTime()" axisLine={false} tickLine={false} tick={false} />
              <YAxis domain={[minPrice - minExtra, maxPrice + maxExtra]} axisLine={false} tickLine={false} tick={false} />
              <Tooltip content={<CustomTooltip payload={undefined} tokenName={token1Name} />} />
            </LineChart>
          ) : <></>
        }


      </ResponsiveContainer>
    </>
  )
}
