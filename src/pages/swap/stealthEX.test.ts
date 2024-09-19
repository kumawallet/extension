import { StealthEX } from './stealthEX';
import { GraphQLClient } from 'graphql-request';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom'; 

const mockEstimatedAmount = {
    getEstimatedAmount: {
      estimated: 1000,
      min: 950,
    },
  };
  const mockCreateSwapResponse = {
    createSwap: {
      destination: 'some-destination-address',
      error: '',
      id: 'swap-id-123',
    },
  };
describe('StealthEX', () => {
  let stealthEx: StealthEX;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockGraphQLClient: any;
  beforeAll(
    () => {
        vi.mock('graphql-request', async() => {
            const actual = await vi.importActual('graphql-request')
            return ({
            ...actual,
            GraphQLClient: vi.fn(),
          })});
    }
  )

  beforeEach(() => {
    mockGraphQLClient = {
      request: vi.fn(),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (GraphQLClient as any).mockImplementation(() => mockGraphQLClient);
    stealthEx = new StealthEX();
  });

  it('should be initialized correctly', async () => {
    const mockTokens = {
      getTokensToSwap: {
        tokens: [
          { image: 'token-image', name: 'Token 1', network: 'eth', symbol: 'TKN1' },
        ],
      },
    };
    mockGraphQLClient.request.mockResolvedValue(mockTokens);

    const result = await stealthEx.getTokens();

    expect(result).toEqual([
      {
        image: 'token-image',
        name: 'Token 1',
        network: 'eth',
        symbol: 'TKN1',
        id: 'TKN1',
        balance: '0',
        decimals: 0,
        label: 'TKN1',
      },
    ]);
    expect(mockGraphQLClient.request).toHaveBeenCalledTimes(1);
  });

  it('should get the estimated amount correctly', async () => {
    
    mockGraphQLClient.request.mockResolvedValue(mockEstimatedAmount);

    const result = await stealthEx.getEstimatedAmount({
      from: 'ETH',
      to: 'BTC',
      amount: '1',
    });

    expect(result).toEqual({
      estimatedAmount: '1000',
      minAmount: '950',
    });
    expect(mockGraphQLClient.request).toHaveBeenCalledWith(expect.anything(), undefined);
  });

  it('should create a swap correctly', async () => {
   

    mockGraphQLClient.request.mockResolvedValue(mockCreateSwapResponse);

    const result = await stealthEx.createSwap({
        addressTo: '0xff6c6e54d84FFfc27FFBaE14c149844b64CBf03C',
        addressFrom: '0xff6c6e54d84FFfc27FFBaE14c149844b64CBf03C',
        amountFrom: '1',
        currencyFrom: 'ETH',
        currencyTo: 'BTC',
        currencyDecimals: 18,
        nativeAsset: {
          symbol: 'ETH',
          decimals: 18,
        },
        assetToSell: {
          symbol: 'BTC',
          decimals: 8,
        },
      });

    expect(result).toEqual({
      fee: {
        gasLimit: '',
        estimatedFee: '0',
        estimatedTotal: '0',
      },
      destination: 'some-destination-address',
      id: 'swap-id-123',
    });
    expect(mockGraphQLClient.request).toHaveBeenCalledTimes(1);
  });

  it('should handle an error in createSwap', async () => {
    const mockCreateSwapResponse = {
      createSwap: {
        destination: '',
        error: 'Some error occurred',
        id: '',
      },
    };

    mockGraphQLClient.request.mockResolvedValue(mockCreateSwapResponse);

    await expect(
      stealthEx.createSwap({
        addressTo: '0xff6c6e54d84FFfc27FFBaE14c149844b64CBf03C',
        addressFrom: '0xff6c6e54d84FFfc27FFBaE14c149844b64CBf03C',
        amountFrom: '1',
        currencyFrom: 'ETH',
        currencyDecimals: 18,
        currencyTo: 'BTC',
        nativeAsset: {
          symbol: 'ETH',
          decimals: 18,
        },
        assetToSell: {
          symbol: 'BTC',
          decimals: 8,
        },
      })
    ).rejects.toThrow('Some error occurred');
  });
});