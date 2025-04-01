
import React, { useState, useEffect } from 'react';
import { Barcode } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
}

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onBarcodeDetected }) => {
  const [barcode, setBarcode] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  // Function to handle barcode input (simulating a USB scanner)
  const handleBarcode = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBarcode(value);
    
    // Clear previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Set a timeout to automatically process the barcode after a short delay
    // This simulates the barcode scanner's "Enter" key press
    const id = window.setTimeout(() => {
      if (value.length > 0) {
        processBarcode();
      }
    }, 500);
    
    setTimeoutId(Number(id));
  };

  // Process the barcode input
  const processBarcode = () => {
    if (barcode.trim()) {
      onBarcodeDetected(barcode.trim());
      setBarcode('');
    }
  };

  // Listen for keyboard events to capture barcodes from USB scanner
  useEffect(() => {
    if (!isListening) return;
    
    let barcodeBuffer = '';
    let lastKeyTime = 0;
    const keyTimeout = 100; // Time between keystrokes in ms
    
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentTime = new Date().getTime();
      
      // If it's a new scan sequence or continuing a fast sequence
      if (currentTime - lastKeyTime > keyTimeout) {
        barcodeBuffer = '';
      }
      
      // Only accept numeric, letters and basic special chars
      if (/[\d\w-]/.test(e.key)) {
        barcodeBuffer += e.key;
      }
      
      // Enter key signals the end of a barcode
      if (e.key === 'Enter' && barcodeBuffer.length > 0) {
        onBarcodeDetected(barcodeBuffer);
        barcodeBuffer = '';
        e.preventDefault();
      }
      
      lastKeyTime = currentTime;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isListening, onBarcodeDetected]);

  const toggleListening = () => {
    setIsListening(prev => !prev);
    if (!isListening) {
      toast.info("Leitura de código de barras ativada");
    } else {
      toast.info("Leitura de código de barras desativada");
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center space-x-2">
        <Input
          value={barcode}
          onChange={handleBarcode}
          placeholder="Digite ou escaneie o código de barras"
          className="flex-1"
          autoFocus
        />
        <Button 
          type="button" 
          onClick={processBarcode}
          variant="secondary"
        >
          Buscar
        </Button>
      </div>
      
      <Button
        type="button"
        onClick={toggleListening}
        variant={isListening ? "default" : "outline"}
        className="w-full"
      >
        <Barcode className="mr-2 h-4 w-4" />
        {isListening ? 'Desativar Leitor' : 'Ativar Leitor USB'}
      </Button>
      
      {isListening && (
        <p className="text-xs text-muted-foreground">
          Leitor de código de barras ativo. Escaneie um código ou pressione ESC para cancelar.
        </p>
      )}
    </div>
  );
};
