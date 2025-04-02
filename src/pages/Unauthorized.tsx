
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="text-center space-y-6 max-w-lg p-6">
        <div className="flex justify-center">
          <ShieldAlert className="h-16 w-16 text-destructive" />
        </div>
        <h1 className="text-3xl font-bold">Acesso Não Autorizado</h1>
        <p className="text-muted-foreground">
          Você não tem permissão para acessar esta página. 
          Apenas administradores podem acessar esta área.
        </p>
        <div className="flex justify-center space-x-4">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Voltar
          </Button>
          <Button onClick={() => navigate('/dashboard')}>
            Ir para o Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
