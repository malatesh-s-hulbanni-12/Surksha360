import Navbar from './Navbar'

export default function Layout({ children, user, setUser }) {
  return (
    <div className="min-h-screen">
      <Navbar user={user} setUser={setUser} />
      <main>{children}</main>
    </div>
  )
}