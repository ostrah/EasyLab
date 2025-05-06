import "../styles/globals.css";
import { DeviceProvider } from "../context/DeviceContext";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">
        <DeviceProvider>{children}</DeviceProvider>
      </body>
    </html>
  );
}
