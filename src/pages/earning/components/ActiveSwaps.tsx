import { Dialog, Disclosure, Transition } from '@headlessui/react'
import { Loading } from '@src/components/common'
import { SuperToken } from '@superfluid-finance/sdk-core'
import { format } from 'date-fns'
import { utils } from 'ethers'
import { FC, Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AiFillDelete } from 'react-icons/ai'
import { BsArrowUpCircle, BsPencil } from 'react-icons/bs'


interface ActiveSwapsProps {
  activeSwaps: any[]
  deleteSwap: (token: SuperToken, tokenName: string) => void
  isLoading?: boolean
}

export const ActiveSwaps: FC<ActiveSwapsProps> = ({
  activeSwaps,
  deleteSwap,
  isLoading
}) => {
  const { t } = useTranslation("earning")

  const [isOpen, setIsOpen] = useState(false)

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }


  return (
    <>
      <div className="relative">

        <button
          type="button"
          onClick={openModal}
          className="rounded-md bg-black bg-opacity-20 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
        >
          {activeSwaps.length} {t("active_swaps")}
        </button>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-custom-gray-bg p-6 text-left align-middle shadow-xl transition-all z-50">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 mb-1"
                  >
                    {t("active_swaps")}
                  </Dialog.Title>
                  {
                    isLoading ? <Loading /> : (
                      <>
                        {
                          activeSwaps.map((swap, index) => (
                            <Disclosure key={index.toString()}>
                              {({ open }) => (
                                <>
                                  <Disclosure.Button className="flex w-full justify-between rounded-lg bg-black bg-opacity-20 px-4 py-2 text-left text-sm font-medium focus:outline-none">
                                    <span>{swap.asset}</span>
                                    <span>{utils.formatEther(swap.flowRate as string).toString()}/s</span>
                                    <BsArrowUpCircle
                                      className={`${!open ? 'rotate-180 transform' : ''
                                        } h-5 w-5`}
                                    />
                                  </Disclosure.Button>
                                  <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm">
                                    <div className='flex justify-end gap-3 items-center'>
                                      <button className='text-blue-600 hover:bg-gray-400 hover:bg-opacity-20 rounded-full p-2'>
                                        <BsPencil className='h-5 w-5' />
                                      </button>
                                      <button className='text-red-500 hover:bg-gray-400 hover:bg-opacity-20  rounded-full p-2' onClick={() => deleteSwap(swap.st, swap.asset)}>
                                        <AiFillDelete className="h-5 w-5" />
                                      </button>
                                    </div>

                                    <p>{t("start_date")}: {format(swap.timestamp, 'dd/MM/yy')}</p>

                                  </Disclosure.Panel>
                                </>
                              )}
                            </Disclosure>
                          ))
                        }
                      </>
                    )
                  }

                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

    </>
  )
}
