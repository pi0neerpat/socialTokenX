import AdsLayout from 'src/layouts/AdsLayout'
import EditAdCell from 'src/components/EditAdCell'

const EditAdPage = ({ id }) => {
  return (
    <AdsLayout>
      <EditAdCell id={id} />
    </AdsLayout>
  )
}

export default EditAdPage
