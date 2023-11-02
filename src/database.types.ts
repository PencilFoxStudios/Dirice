export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      campaigns: {
        Row: {
          created_at: string
          description: string | null
          dm_id: string
          id: number
          manager_ids: string[]
          name: string
          open: boolean
          photo_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          dm_id: string
          id?: number
          manager_ids?: string[]
          name?: string
          open?: boolean
          photo_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          dm_id?: string
          id?: number
          manager_ids?: string[]
          name?: string
          open?: boolean
          photo_url?: string | null
        }
        Relationships: []
      }
      characters: {
        Row: {
          campaign_id: number | null
          can_manage: string[]
          can_roll_as: string[]
          created_at: string
          description: string | null
          id: number
          name: string
          owner_id: string
          photo_url: string
          quote: string | null
          stats: Json
          statuses: Json
        }
        Insert: {
          campaign_id?: number | null
          can_manage?: string[]
          can_roll_as?: string[]
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          owner_id: string
          photo_url?: string
          quote?: string | null
          stats?: Json
          statuses?: Json
        }
        Update: {
          campaign_id?: number | null
          can_manage?: string[]
          can_roll_as?: string[]
          created_at?: string
          description?: string | null
          id?: number
          name?: string
          owner_id?: string
          photo_url?: string
          quote?: string | null
          stats?: Json
          statuses?: Json
        }
        Relationships: [
          {
            foreignKeyName: "characters_campaign_id_fkey"
            columns: ["campaign_id"]
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          }
        ]
      }
      players: {
        Row: {
          selected_campaign: number | null
          selected_character: number | null
          user_id: string
        }
        Insert: {
          selected_campaign?: number | null
          selected_character?: number | null
          user_id: string
        }
        Update: {
          selected_campaign?: number | null
          selected_character?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "players_selected_campaign_fkey"
            columns: ["selected_campaign"]
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "players_selected_character_fkey"
            columns: ["selected_character"]
            referencedRelation: "characters"
            referencedColumns: ["id"]
          }
        ]
      }
      rolls: {
        Row: {
          campaign_id: number | null
          character_id: number | null
          created_at: string
          dice_amt: number
          dice_max: number
          id: number
          roll_name: string
        }
        Insert: {
          campaign_id?: number | null
          character_id?: number | null
          created_at?: string
          dice_amt?: number
          dice_max?: number
          id?: number
          roll_name: string
        }
        Update: {
          campaign_id?: number | null
          character_id?: number | null
          created_at?: string
          dice_amt?: number
          dice_max?: number
          id?: number
          roll_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "rolls_campaign_id_fkey"
            columns: ["campaign_id"]
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rolls_character_id_fkey"
            columns: ["character_id"]
            referencedRelation: "characters"
            referencedColumns: ["id"]
          }
        ]
      }
      statuses: {
        Row: {
          campaign_id: number
          created_at: string
          id: number
          max_val: number
          min_val: number
          status_description: string | null
          status_name: string
        }
        Insert: {
          campaign_id: number
          created_at?: string
          id?: number
          max_val?: number
          min_val?: number
          status_description?: string | null
          status_name: string
        }
        Update: {
          campaign_id?: number
          created_at?: string
          id?: number
          max_val?: number
          min_val?: number
          status_description?: string | null
          status_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "statuses_campaign_id_fkey"
            columns: ["campaign_id"]
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
