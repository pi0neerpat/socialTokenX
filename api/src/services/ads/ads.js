import { db } from 'src/lib/db'

import { JsonRpcProvider } from '@ethersproject/providers'

export const ads = () => {
  return db.ad.findMany()
}

export const ad = ({ id }) => {
  return db.ad.findOne({
    where: { id },
  })
}

export const createAd = ({ input }) => {
  return db.ad.create({
    data: input,
  })
}

export const updateAd = async ({ id, input }) => {
  try {
    const walletlessProvider = new JsonRpcProvider(process.env.RPC_ENDPOINT)
    const { hash, owner, text, amount } = input
    console.log(owner)
    const ad = await db.ad.findOne({
      where: { id },
    })

    const { amount: adAmount } = ad
    if (Number(adAmount) >= Number(amount))
      return new Error('Amount is too small')
    // const receipt = await walletlessProvider.waitForTransaction(hash)
    // console.log(receipt)
    // if (receipt.status === 0)
    //   return new Error(`Error updating ad ${id}. Transaction failed`)

    // Validate recipient
    // Validate the amount
    return db.ad.update({
      data: { owner, text, amount: amount },
      where: { id },
    })
  } catch (e) {
    return new Error(`Error updating ad ${id}. ${e}`)
  }
}

export const deleteAd = ({ id }) => {
  return new Error(`Only admins can do this!`)

  // return db.ad.delete({
  //   where: { id },
  // })
}
