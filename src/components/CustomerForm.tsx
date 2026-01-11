import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCart } from '@/context/CartContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Phone } from 'lucide-react';

const customerSchema = z.object({
  name: z.string().trim().min(3, 'Informe seu nome completo'),
  phone: z.string()
    .trim()
    .min(10, 'Telefone inválido')
    .max(15, 'Telefone inválido')
    .regex(/^\(?[1-9]{2}\)?\s?9?[0-9]{4}-?[0-9]{4}$/, 'Telefone inválido'),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  onSubmit: () => void;
}

export function CustomerForm({ onSubmit }: CustomerFormProps) {
  const { setCustomerInfo } = useCart();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      phone: '',
    },
  });

  const handleFormSubmit = (data: CustomerFormData) => {
    setCustomerInfo({
      name: data.name,
      phone: data.phone,
    });
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
          <User className="w-4 h-4 text-primary-foreground" />
        </div>
        <h3 className="font-heading font-semibold">Seus Dados</h3>
      </div>

      <p className="text-sm text-muted-foreground">
        Informe seus dados para contato e identificação no drive-thru.
      </p>

      <div className="space-y-1.5">
        <Label htmlFor="name">Nome Completo</Label>
        <Input
          id="name"
          placeholder="Ex: João Silva"
          {...register('name')}
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Telefone / WhatsApp</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="phone"
            placeholder="(11) 99999-9999"
            {...register('phone')}
            className={`pl-10 ${errors.phone ? 'border-destructive' : ''}`}
          />
        </div>
        {errors.phone && (
          <p className="text-xs text-destructive">{errors.phone.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full gradient-primary border-0 shadow-food mt-4"
        disabled={!isValid}
      >
        Continuar para Pagamento
      </Button>
    </form>
  );
}
