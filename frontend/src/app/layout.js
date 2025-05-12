import "../styles/globals.css";
import { DeviceProvider } from "../context/DeviceContext";
import { GroupProvider } from "../context/GroupContext";
import { ConnectionProvider } from "../context/ConnectionContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">
        <GroupProvider>
          <DeviceProvider>
            <ConnectionProvider>
              {children}
            </ConnectionProvider>
          </DeviceProvider>
        </GroupProvider>
      </body>
    </html>
  );
}
