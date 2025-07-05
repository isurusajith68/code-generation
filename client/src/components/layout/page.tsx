import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-gray-800 text-white h-full fixed">
        <div className="p-4">
          <h1 className="text-xl font-bold">Code Generation</h1>
          <nav className="mt-4">
            <ul>
              <li className="mb-2">
                <a href="/" className="text-gray-300 hover:text-white">
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/code-generation-2"
                  className="text-gray-300 hover:text-white"
                >
                  Code Generation 2
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </aside>
      <main className="ml-64 p-4 w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;