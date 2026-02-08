type PageProps = {
  params: Promise<{ username: string }>
} 
//doing this to ensure that the params are awaited before being used in the component. This is necessary because the params are passed as a promise and we need to wait for it to resolve before accessing the username.

export default async function Page({ params }: PageProps) {
  const { username } = await params

  return (
    <div>
      <h1>Username: {username}</h1>
    </div>
  )
}
