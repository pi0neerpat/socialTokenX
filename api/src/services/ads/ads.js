import { db } from 'src/lib/db'

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

export const updateAd = ({ id, input }) => {
  return db.ad.update({
    data: input,
    where: { id },
  })
}

export const deleteAd = ({ id }) => {
  return db.ad.delete({
    where: { id },
  })
}
