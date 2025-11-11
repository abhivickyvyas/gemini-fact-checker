
import React from 'react';
import { XCircleIcon } from './icons';

interface ErrorAlertProps {
  message: string;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message }) => (
  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow" role="alert">
    <div className="flex">
      <div className="py-1">
        <XCircleIcon className="w-6 h-6 text-red-500 mr-4" />
      </div>
      <div>
        <p className="font-bold">Error</p>
        <p>{message}</p>
      </div>
    </div>
  </div>
);

export default ErrorAlert;
