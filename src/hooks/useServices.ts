import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesApi, servicePackagesApi, serviceOrdersApi, partnersApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import type { ServiceCategory, ServiceProvider, ServicePackage, ServiceOrder, PartnerApplication, PartnerApplicationInput, ServiceOrderInput, ServiceOrderUpdate } from '@/types';

export function useServiceProviders(category?: ServiceCategory) {
  return useQuery({
    queryKey: ['serviceProviders', category],
    queryFn: async () => {
      const res = await servicesApi.getProviders(category);
      return res.providers as ServiceProvider[];
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useServiceProvider(providerId: string) {
  return useQuery({
    queryKey: ['serviceProvider', providerId],
    queryFn: async () => {
      const res = await servicesApi.getProvider(providerId);
      return res.provider as ServiceProvider;
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useServicePackages(providerId?: string) {
  return useQuery({
    queryKey: ['servicePackages', providerId],
    queryFn: async () => {
      if (!providerId) return [] as ServicePackage[];
      const res = await servicePackagesApi.getByProvider(providerId);
      return res.packages as ServicePackage[];
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useServiceOrders() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['serviceOrders'],
    queryFn: async () => {
      const res = await serviceOrdersApi.getAll();
      return res.orders as ServiceOrder[];
    },
    staleTime: 1000 * 60,
    enabled: isAuthenticated,
  });
}

export function useCreateServiceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ServiceOrderInput & { deliveryMode?: string }) => {
      return serviceOrdersApi.create({
        providerId: input.providerId,
        packageId: input.packageId,
        cardIds: input.cardIds,
        deliveryMode: input.deliveryMode,
        shippingAddress: input.shippingAddress,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
      queryClient.invalidateQueries({ queryKey: ['vault'] });
    },
  });
}

export function useServiceOrder(orderId?: string) {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['serviceOrder', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const res = await serviceOrdersApi.getById(orderId);
      return res as ServiceOrder | null;
    },
    enabled: !!orderId && isAuthenticated,
    staleTime: 1000 * 60,
  });
}

type UpdateServiceOrderArgs =
  | { orderId: string; action: 'advance' | 'cancel'; gradeResult?: string; trackingNumber?: string }
  // Legacy shape used by the older SellerOrdersScreen — translated to the action API
  | { orderId: string; update: ServiceOrderUpdate };

export function useUpdateServiceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: UpdateServiceOrderArgs) => {
      if ('action' in args) {
        return serviceOrdersApi.update(args.orderId, {
          action: args.action,
          gradeResult: args.gradeResult,
          trackingNumber: args.trackingNumber,
        });
      }
      // Legacy translation: cancel → cancel; more completed stages → advance N times
      const { orderId, update } = args;
      if (update.status === 'CANCELLED') {
        return serviceOrdersApi.update(orderId, { action: 'cancel' });
      }
      const current = await serviceOrdersApi.getById(orderId);
      if (update.stages) {
        const target = update.stages.filter((s) => s.completed).length;
        const now = current.stages.filter((s) => s.completed).length;
        let result = current;
        for (let i = now; i < target; i++) {
          result = await serviceOrdersApi.update(orderId, { action: 'advance', trackingNumber: update.trackingNumber });
        }
        return result;
      }
      return current;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
      queryClient.invalidateQueries({ queryKey: ['receivedServiceOrders'] });
      queryClient.invalidateQueries({ queryKey: ['serviceOrder', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['vault'] });
    },
  });
}

// ─── Owner: provider profile & packages & incoming orders ────────────

export function useMyProvider() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['myProvider'],
    queryFn: async () => {
      const res = await servicesApi.getMyProvider();
      return res.provider;
    },
    staleTime: 1000 * 60,
    enabled: isAuthenticated,
  });
}

export function useBecomeProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: servicesApi.becomeProvider,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myProvider'] }),
  });
}

export function useUpdateProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: servicesApi.updateProvider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myProvider'] });
      queryClient.invalidateQueries({ queryKey: ['serviceProviders'] });
    },
  });
}

export function useMyPackages() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['myPackages'],
    queryFn: async () => {
      const res = await servicesApi.getMyPackages();
      return res.packages;
    },
    staleTime: 1000 * 60,
    enabled: isAuthenticated,
  });
}

export function useAddPackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: servicesApi.addPackage,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myPackages'] }),
  });
}

export function useUpdatePackage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof servicesApi.updatePackage>[1] }) =>
      servicesApi.updatePackage(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['myPackages'] }),
  });
}

export function useReceivedServiceOrders() {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['receivedServiceOrders'],
    queryFn: async () => {
      const res = await serviceOrdersApi.getReceived();
      return res.orders as ServiceOrder[];
    },
    staleTime: 1000 * 30,
    enabled: isAuthenticated,
  });
}

export function useSubmitPartnerApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: PartnerApplicationInput) => {
      const res = await partnersApi.submitApplication({
        companyName: input.companyName,
        contactName: input.contactName,
        email: input.email,
        phone: input.phone,
        website: input.website,
        serviceCategories: input.serviceCategories,
        serviceTypes: input.serviceTypes,
        acceptedGraders: input.acceptedGraders,
        customGraderNote: input.customGraderNote,
        proposedPackages: input.proposedPackages,
        message: input.message,
      });
      return res.application as PartnerApplication;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['partnerApplications'] }),
  });
}

export function usePartnerApplications() {
  return useQuery({
    queryKey: ['partnerApplications'],
    queryFn: async () => {
      // TODO: backend endpoint not implemented yet
      return [] as PartnerApplication[];
    },
    staleTime: 1000 * 60,
  });
}
