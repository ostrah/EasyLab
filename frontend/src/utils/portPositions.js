// Расчет позиции порта в процентах относительно устройства
export function calculatePortPosition(index, totalPorts, deviceType) {
  // Для PC только один порт
  if (deviceType === 'pc') {
    return { x: 50, y: 0 }; // Верхний край
  }

  // Для роутера и свича распределяем порты по периметру
  const positions = [];
  const sideLength = Math.ceil(totalPorts / 4); // Количество портов на одной стороне

  // Верхняя сторона
  for (let i = 0; i < sideLength; i++) {
    positions.push({
      x: (i + 1) * (100 / (sideLength + 1)),
      y: 0
    });
  }

  // Правая сторона
  for (let i = 0; i < sideLength; i++) {
    positions.push({
      x: 100,
      y: (i + 1) * (100 / (sideLength + 1))
    });
  }

  // Нижняя сторона
  for (let i = 0; i < sideLength; i++) {
    positions.push({
      x: 100 - (i + 1) * (100 / (sideLength + 1)),
      y: 100
    });
  }

  // Левая сторона
  for (let i = 0; i < sideLength; i++) {
    positions.push({
      x: 0,
      y: 100 - (i + 1) * (100 / (sideLength + 1))
    });
  }

  // Возвращаем позицию для текущего индекса
  return positions[index] || { x: 50, y: 50 }; // Fallback в центр
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