'use client';

import React, { useState, useEffect } from 'react';
import {
  CloudArrowDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { CompanyInfo } from '../../types';
import {
  importCompanyFromShopify,
  getCompanyInfo,
  formatCompanyInfo
} from '../../lib/company-import';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ImportStatus {
  type: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}

export default function CompanyImportClient() {
  const [currentCompany, setCurrentCompany] = useState<CompanyInfo | null>(
    null
  );
  const [importStatus, setImportStatus] = useState<ImportStatus>({
    type: 'idle'
  });
  const [loading, setLoading] = useState(true);

  // Load current company info on component mount
  useEffect(() => {
    loadCurrentCompanyInfo();
  }, []);

  const loadCurrentCompanyInfo = async () => {
    try {
      setLoading(true);
      const result = await getCompanyInfo();

      if (result.success) {
        setCurrentCompany(result.data || null);
      } else {
        console.error('Failed to load company info:', result.error);
      }
    } catch (error) {
      console.error('Error loading company info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImportCompany = async () => {
    setImportStatus({
      type: 'loading',
      message: 'Importing company information from Shopify...'
    });

    try {
      const result = await importCompanyFromShopify();

      if (result.success && result.data) {
        setCurrentCompany(result.data);
        setImportStatus({
          type: 'success',
          message: 'Company information imported successfully!'
        });
      } else {
        setImportStatus({
          type: 'error',
          message: result.error || 'Import failed'
        });
      }
    } catch (error) {
      setImportStatus({
        type: 'error',
        message: 'Failed to import company information'
      });
    }
  };

  const renderStatus = (status: ImportStatus, className: string = '') => {
    if (status.type === 'idle') return null;

    const icons = {
      loading: <ArrowPathIcon className="w-5 h-5 animate-spin" />,
      success: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
      error: <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
    };

    const colors = {
      loading: 'bg-blue-50 border-blue-200 text-blue-800',
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800'
    };

    return (
      <div
        className={`flex items-center gap-2 p-3 rounded-lg border ${colors[status.type]} ${className}`}
      >
        {icons[status.type]}
        <span className="text-sm font-medium">{status.message}</span>
      </div>
    );
  };

  const renderCompanyInfo = () => {
    if (!currentCompany) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-2">
            <InformationCircleIcon className="w-5 h-5 text-yellow-600" />
            <h3 className="font-medium text-yellow-800">
              No Company Information
            </h3>
          </div>
          <p className="text-yellow-700 text-sm">
            No company information found in the database. Import from Shopify to
            get started.
          </p>
        </div>
      );
    }

    const formatted = formatCompanyInfo(currentCompany);

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Current Company Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <p className="text-sm text-gray-900">{formatted.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <p className="text-sm text-gray-900">{formatted.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <p className="text-sm text-gray-900">{formatted.phone}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Policies
            </label>
            <p className="text-sm text-gray-900">
              {formatted.policies} policies
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <p className="text-sm text-gray-900">
              {formatted.description || 'No description available'}
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <p className="text-sm text-gray-900">{formatted.address}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Updated
            </label>
            <p className="text-sm text-gray-900">{formatted.lastUpdated}</p>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Company Information Import
        </h1>
        <p className="text-gray-600 mt-1">
          Import and manage company information from your Shopify store.
        </p>
      </div>

      {/* Import Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Import Company Information
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Import company details, policies, and contact information from
              Shopify.
            </p>
          </div>
          <button
            onClick={handleImportCompany}
            disabled={importStatus.type === 'loading'}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {importStatus.type === 'loading' ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
            ) : (
              <CloudArrowDownIcon className="w-4 h-4" />
            )}
            Import from Shopify
          </button>
        </div>
        {renderStatus(importStatus)}
      </div>

      {/* Current Company Info */}
      {renderCompanyInfo()}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={loadCurrentCompanyInfo}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          <ArrowPathIcon className="w-4 h-4" />
          Refresh Company Info
        </button>
      </div>
    </div>
  );
}
