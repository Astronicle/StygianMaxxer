type PageProps = {
  params: Promise<{ stygianID: string }>
} 
//doing this to ensure that the params are awaited before being used in the component. This is necessary because the params are passed as a promise and we need to wait for it to resolve before accessing the stygianID.

export default async function Page({ params }: PageProps) {
  const { stygianID } = await params

  return (
    <div>
      <h1>Stygian ID: {stygianID}</h1>
    </div>
  )
}
