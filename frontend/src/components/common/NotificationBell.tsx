import React, { useState } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import Badge from './Badge';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
}

const NotificationBell: React.FC = () => {
  const [notifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Order Shipped',
      message: 'Your order #12345 has been shipped',
      type: 'info',
      read: false,
      timestamp: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      title: 'New Deal Alert',
      message: '50% off on gaming laptops',
      type: 'success',
      read: false,
      timestamp: '2024-01-14T15:20:00Z',
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="relative p-2 text-gray-400 hover:text-gray-500">
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <Badge
            variant="error"
            size="sm"
            className="absolute -top-1 -right-1 min-w-[18px] h-4 flex items-center justify-center text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Menu.Button>

      <Transition
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
            </div>
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                No notifications
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <Menu.Item key={notification.id}>
                    <div className={`px-4 py-3 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}>
                      <div className="flex items-start">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1" />
                        )}
                      </div>
                    </div>
                  </Menu.Item>
                ))}
              </div>
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default NotificationBell;