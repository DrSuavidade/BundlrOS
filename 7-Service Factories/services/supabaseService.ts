/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';
import { Factory, Status, Deliverable, LogEntry, Profile } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const TABLE = 'service_factories';

// Map DB Row to Factory
const mapRowToFactory = (row: any): Factory => ({
    id: row.id,
    contractId: row.contract_id,
    clientName: row.client_name,
    templateId: row.template_id,
    currentStageId: row.current_stage_id,
    status: row.status as Status,
    deliverables: row.deliverables as Deliverable[],
    blockers: row.blockers || [],
    logs: row.logs as LogEntry[],
    startedAt: row.started_at,
    lastUpdated: row.last_updated,
    assigneeId: row.assignee_id,
});

// Map Factory to DB Row for Insert/Update
const mapFactoryToRow = (factory: Omit<Factory, 'id'>) => ({
    contract_id: factory.contractId,
    client_name: factory.clientName,
    template_id: factory.templateId,
    current_stage_id: factory.currentStageId,
    status: factory.status,
    deliverables: factory.deliverables,
    blockers: factory.blockers,
    logs: factory.logs,
    started_at: factory.startedAt,
    last_updated: new Date().toISOString(), // Always update timestamp
    assignee_id: factory.assigneeId,
});

export const FactoryService = {
    getAll: async (): Promise<Factory[]> => {
        const { data, error } = await supabase
            .from(TABLE)
            .select('*')
            .order('last_updated', { ascending: false });

        if (error) {
            console.error('Error fetching factories:', error);
            return [];
        }
        return data.map(mapRowToFactory);
    },

    getProfiles: async (): Promise<Profile[]> => {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, name, avatar_url, role');

        if (error) {
            console.error('Error fetching profiles:', error);
            return [];
        }
        return data as Profile[];
    },

    create: async (factory: Factory): Promise<Factory | null> => {
        // We intentionally ignore the 'id' from the factory object if it's generated locally,
        // and let Supabase generate headers. OR we can use the local ID if we want.
        // Let's rely on Supabase ID but we pass the rest.
        // Actually, pipelineService generateId() creates a short string, UUID is better from DB.
        // But for consistency with frontend logic, we can pass the ID if we change column type or just let DB handle.
        // Let's use the DB generated UUID for robustness, but we must update the local object.

        // Actually, `createFactory` returns an object with an ID. 
        // If I use `gen_random_uuid()` in DB, I should ignore the local ID.

        const { id, ...rest } = factory;
        const row = mapFactoryToRow(rest);

        const { data, error } = await supabase
            .from(TABLE)
            .insert(row)
            .select()
            .single();

        if (error) {
            console.error('Error creating factory:', error);
            return null;
        }
        return mapRowToFactory(data);
    },

    update: async (factory: Factory): Promise<Factory | null> => {
        const row = mapFactoryToRow(factory);
        const { data, error } = await supabase
            .from(TABLE)
            .update(row)
            .eq('id', factory.id)
            .select()
            .single();

        if (error) {
            console.error('Error updating factory:', error);
            return null;
        }
        return mapRowToFactory(data);
    },

    delete: async (id: string): Promise<boolean> => {
        const { error } = await supabase
            .from(TABLE)
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting factory:', error);
            return false;
        }
        return true;
    },

    getCurrentUser: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) return user;

        // Fallback: Check for mocked session in localStorage (used by Identity module)
        try {
            const storedSession = localStorage.getItem("nexus_session");
            if (storedSession) {
                const parsed = JSON.parse(storedSession);
                if (parsed && parsed.id) {
                    return {
                        id: parsed.id,
                        email: parsed.email,
                        // Add other fields if needed to match User interface partially
                        user_metadata: parsed,
                        app_metadata: {},
                        aud: "authenticated",
                        created_at: new Date().toISOString()
                    } as any;
                }
            }
        } catch (e) {
            console.error("Failed to read nexus_session", e);
        }

        return null;
    }
};
