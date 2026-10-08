import React from 'react';
import Button from './Button';

export default function EmptyState({ title, description, actionText, onAction, icon: Icon }) {
  return (
    <div className="text-center py-12 px-4 bg-white border border-dashed border-gray-300 rounded-lg">
      {Icon && (
        <div className="mx-auto w-12 h-12 text-gray-400 bg-gray-50 rounded-full flex items-center justify-center mb-3">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">{description}</p>
      {actionText && onAction && (
        <div className="mt-5">
          <Button onClick={onAction} variant="primary">
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
}
