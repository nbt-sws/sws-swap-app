import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesApi, servicePackagesApi, serviceOrdersApi, partnersApi } from '@/lib/api';
import * as mockApi from '@/services/mockApi';
import { withFallback } from '@/hooks/useApi';
import type { ServiceCategory, ServiceProvider, ServicePackage, ServiceOrder, PartnerApplication, PartnerApplicationInput, ServiceOrderInput } from '@/types';

export function useServiceProviders(category?: ServiceCategory) {
  return useQuery({
    queryKey: ['serviceProviders', category],
    queryFn: async () => {
      const providers = await withFallback(
        async () => {
          const res = await servicesApi.getProviders(category);
          return res.providers as ServiceProvider[];
        },
        () => mockApi.fetchServiceProviders(category)
      );
      return providers;
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function useServiceProvider(providerId: string) {
  return useQuery({
    queryKey: ['serviceProvider', providerId],
    queryFn: async () => {
      const provider = await withFallback(
        async () => {
          const res = await servicesApi.getProvider(providerId);
          return res.provider as ServiceProvider;
        },
        async () => {
          const providers = await mockApi.fetchServiceProviders();
          return providers.find((p) => p.id === providerId) ?? null;
        }
      );
      return provider;
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useServicePackages(providerId?: string) {
  return useQuery({
    queryKey: ['servicePackages', providerId],
    queryFn: async () => {
      const packages = await withFallback(
        async () => {
          if (!providerId) return [] as ServicePackage[];
          const res = await servicePackagesApi.getByProvider(providerId);
          return res.packages as ServicePackage[];
        },
        async () => {
          if (!providerId) return [];
          const provider = await mockApi.fetchServiceProvider(providerId);
          return provider?.packages ?? [];
        }
      );
      return packages as ServicePackage[];
    },
    enabled: !!providerId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useServiceOrders() {
  return useQuery({
    queryKey: ['serviceOrders'],
    queryFn: async () => {
      const orders = await withFallback(
        async () => [] as ServiceOrder[], // backend endpoint not implemented yet
        () => mockApi.fetchServiceOrders?.() ?? Promise.resolve([])
      );
      return orders as ServiceOrder[];
    },
    staleTime: 1000 * 60,
  });
}

export function useCreateServiceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ServiceOrderInput) => {
      const order = await withFallback(
        async () => {
          const res = await serviceOrdersApi.create({
            category: input.category,
            providerId: input.providerId,
            cardIds: input.cardIds,
            shippingAddress: input.shippingAddress,
          });
          return res.order as ServiceOrder;
        },
        () => mockApi.createServiceOrder(input)
      );
      return order;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['serviceOrders'] }),
  });
}

export function useSubmitPartnerApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: PartnerApplicationInput) => {
      const application = await withFallback(
        async () => {
          const res = await partnersApi.submitApplication({
            companyName: input.companyName,
            contactName: input.contactName,
            email: input.email,
            phone: input.phone,
            website: input.website,
            serviceCategories: input.serviceCategories,
            serviceTypes: input.serviceTypes,
            acceptedGraders: input.acceptedGraders,
            message: input.message,
          });
          return res.application as PartnerApplication;
        },
        () => mockApi.submitPartnerApplication(input)
      );
      return application;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['partnerApplications'] }),
  });
}

export function usePartnerApplications() {
  return useQuery({
    queryKey: ['partnerApplications'],
    queryFn: async () => {
      const applications = await withFallback(
        async () => [] as PartnerApplication[], // backend endpoint not implemented yet
        () => mockApi.fetchPartnerApplications()
      );
      return applications;
    },
    staleTime: 1000 * 60,
  });
}
