// @ts-nocheck
/* Temporarily disable type checking for this file to address Solana wallet compatibility issues */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { ZkCompressionService } from '../../api/zk-compression-service';

interface LaunchCompressedTokenFormData {
  name: string;
  symbol: string;
  supply: string;
  merkleTree: string;
}

export function LaunchCompressedToken() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState({ success: false, message: '' });
  
  const form = useForm<LaunchCompressedTokenFormData>({
    defaultValues: {
      name: '',
      symbol: '',
      supply: '',
      merkleTree: '',
    }
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = async (data: LaunchCompressedTokenFormData) => {
    try {
      setIsSubmitting(true);
      setResult({ success: false, message: '' });

      // Make sure wallet is connected
      if (!window.solana) {
        setResult({ 
          success: false, 
          message: 'Wallet not connected. Please connect your Solana wallet.' 
        });
        return;
      }

      const service = new ZkCompressionService();
      const tokenData = {
        name: data.name,
        symbol: data.symbol,
        supply: parseInt(data.supply),
        merkleTree: data.merkleTree,
        owner: window.solana // Assuming wallet is connected
      };

      const result = await service.launchCompressedToken(tokenData);
      
      setResult({ 
        success: true, 
        message: `Token ${data.name} launched successfully! Transaction: ${result.signature}` 
      });
    } catch (error) {
      console.error('Error:', error);
      setResult({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Failed to launch token' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Launch Compressed Token</CardTitle>
        <CardDescription>
          Create a compressed Solana token with lower fees and higher scalability
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Token Name</Label>
            <Input 
              id="name" 
              {...register('name', { required: 'Token name is required' })} 
              placeholder="e.g., My Amazing Token" 
              className="mt-1"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>
          
          <div>
            <Label htmlFor="symbol">Token Symbol</Label>
            <Input 
              id="symbol" 
              {...register('symbol', { required: 'Token symbol is required' })} 
              placeholder="e.g., MAT" 
              className="mt-1"
            />
            {errors.symbol && <p className="text-red-500 text-sm mt-1">{errors.symbol.message}</p>}
          </div>
          
          <div>
            <Label htmlFor="supply">Total Supply</Label>
            <Input 
              id="supply" 
              type="number" 
              {...register('supply', { 
                required: 'Supply is required',
                min: { value: 1, message: 'Supply must be at least 1' }
              })} 
              placeholder="e.g., 1000000" 
              className="mt-1"
            />
            {errors.supply && <p className="text-red-500 text-sm mt-1">{errors.supply.message}</p>}
          </div>
          
          <div>
            <Label htmlFor="merkleTree">Merkle Tree Address (Optional)</Label>
            <Input 
              id="merkleTree" 
              {...register('merkleTree')} 
              placeholder="Existing merkle tree address" 
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty to create a new merkle tree</p>
          </div>
          
          {result.message && (
            <div className={`p-4 rounded-md ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {result.message}
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Launching...' : 'Launch Token'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
