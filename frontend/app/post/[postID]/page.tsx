type PageProps = {
  params: Promise<{ postID: string }>
} 
//doing this to ensure that the params are awaited before being used in the component. This is necessary because the params are passed as a promise and we need to wait for it to resolve before accessing the postID.

export default async function Page({ params }: PageProps) {
  const { postID } = await params

  return (
    <div>
      <h1>Post ID: {postID}</h1>
    </div>
  )
}
