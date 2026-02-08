type PageProps = {
  params: Promise<{ bossID: string }>
} 
//doing this to ensure that the params are awaited before being used in the component. This is necessary because the params are passed as a promise and we need to wait for it to resolve before accessing the bossID.

export default async function Page({ params }: PageProps) {
  const { bossID } = await params

  return (
    <div>
      <h1>Boss ID: {bossID}</h1>
    </div>
  )
}
