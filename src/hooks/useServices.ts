import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesApi, servicePackagesApi, serviceOrdersApi, partnersApi } from '@/lib/api';
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
  return useQuery({
    queryKey: ['serviceOrders'],
    queryFn: async () => {
      // TODO: backend endpoint not implemented yet
      return [] as ServiceOrder[];
    },
    staleTime: 1000 * 60,
  });
}

export function useCreateServiceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ServiceOrderInput) => {
      const res = await serviceOrdersApi.create({
        category: input.category,
        providerId: input.providerId,
        packageId: input.packageId,
        cardIds: input.cardIds,
        shippingAddress: input.shippingAddress,
      });
      return res.order as ServiceOrder;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
      queryClient.invalidateQueries({ queryKey: ['vault'] });
    },
  });
}

export function useServiceOrder(orderId?: string) {
  return useQuery({
    queryKey: ['serviceOrder', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const res = await serviceOrdersApi.getById(orderId);
      return res.order as ServiceOrder | null;
    },
    enabled: !!orderId,
    staleTime: 1000 * 60,
  });
}

export function useUpdateServiceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, update }: { orderId: string; update: ServiceOrderUpdate }) => {
      const res = await serviceOrdersApi.update(orderId, update);
      return res.order as ServiceOrder;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['serviceOrders'] });
      queryClient.invalidateQueries({ queryKey: ['serviceOrder', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['vault'] });
    },
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
