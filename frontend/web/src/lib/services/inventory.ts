import axiosClient from "@/lib/clients/axiosClient"
import { API_INVENTORY_URL } from "@/lib/constants"
import { ListResponse } from "@/types/list"
import { PaginationParams } from "@/types/pagination"
import { CreateInventoryItemRequest, InventoryItem } from "@/types/inventory"

interface InventoryService {
    create: (data: CreateInventoryItemRequest) => Promise<InventoryItem>
    delete: (id: number) => Promise<void>
    fetch: (
        page?: number,
        pageSize?: number,
        searchTerm?: string,
        ordering?: string,
    ) => Promise<ListResponse<InventoryItem>>
    get: (id: number) => Promise<InventoryItem>
    patch: (
        id: number,
        data: Partial<CreateInventoryItemRequest>,
    ) => Promise<InventoryItem>
}

const inventoryService: InventoryService = {
    create: async (data: CreateInventoryItemRequest): Promise<InventoryItem> => {
        const res = await axiosClient.post<InventoryItem>(
            API_INVENTORY_URL,
            data,
        )
        return res.data || ({} as InventoryItem)
    },
    delete: async (id: number): Promise<void> => {
        await axiosClient.delete(`${API_INVENTORY_URL}${id}/`)
        return
    },
    fetch: async (
        page?: number,
        pageSize?: number,
        searchTerm?: string,
        ordering?: string,
    ): Promise<ListResponse<InventoryItem>> => {
        const params: PaginationParams = { page, page_size: pageSize }
        if (searchTerm) params.search = searchTerm
        if (ordering) params.ordering = ordering
        const r = await axiosClient.get<ListResponse<InventoryItem>>(
            API_INVENTORY_URL,
            {
                params,
            },
        )
        return r.data || { results: [], count: 0, next: null, previous: null }
    },
    get: async (id: number): Promise<InventoryItem> => {
        const r = await axiosClient.get<InventoryItem>(
            `${API_INVENTORY_URL}${id}/`,
        )
        return r.data || ({} as InventoryItem)
    },
    patch: async (
        id: number,
        data: Partial<CreateInventoryItemRequest>,
    ): Promise<InventoryItem> => {
        const r = await axiosClient.patch<InventoryItem>(
            `${API_INVENTORY_URL}${id}/`,
            data,
        )
        return r.data || ({} as InventoryItem)
    },
}

export default inventoryService
