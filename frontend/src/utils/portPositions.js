// Расчет позиции порта на устройстве
export function calculatePortPosition(portName, deviceType) {
  // Для PC только один порт
  if (deviceType === 'pc') {
    return { x: 50, y: 0 }; // Сверху по центру
  }

  // Для роутера и свича
  const portNumber = parseInt(portName.split('/')[1]);
  const isSerial = portName.startsWith('s');
  const isConsole = portName === 'console';

  if (isConsole) {
    return { x: 50, y: 100 }; // Снизу по центру
  }

  if (isSerial) {
    // Serial порты справа
    return { x: 100, y: 30 + portNumber * 20 };
  }

  // Ethernet порты слева
  return { x: 0, y: 30 + portNumber * 20 };
}

// Определение цвета кабеля в зависимости от типов портов
export function getCableColor(portA, portB) {
  const isSerialA = portA.startsWith('s');
  const isSerialB = portB.startsWith('s');
  const isConsoleA = portA === 'console';
  const isConsoleB = portB === 'console';

  if (isSerialA || isSerialB) {
    return '#c66'; // Красный для serial
  }

  if (isConsoleA || isConsoleB) {
    return '#66c'; // Синий для console
  }

  return '#6c6'; // Зеленый для ethernet
}

// Получение типа кабеля для соединения
export function getCableType(ifaceA, ifaceB) {
  // Если хотя бы один порт серийный, используем серийный кабель
  if (ifaceA.startsWith('s') || ifaceB.startsWith('s')) {
    return 'SERIAL';
  }
  
  // Если оба порта Ethernet, используем UTP
  if (ifaceA.startsWith('f') && ifaceB.startsWith('f')) {
    return 'UTP';
  }
  
  // По умолчанию UTP
  return 'UTP';
} 