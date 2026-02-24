export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      competitor_products: {
        Row: {
          competitor_name: string
          competitor_price: number
          competitor_product_name: string
          competitor_url: string | null
          created_at: string
          id: string
          our_price: number | null
          price_difference: number | null
          price_difference_pct: number | null
          product_id: string | null
          recommendation: string | null
          scan_id: string | null
        }
        Insert: {
          competitor_name?: string
          competitor_price: number
          competitor_product_name: string
          competitor_url?: string | null
          created_at?: string
          id?: string
          our_price?: number | null
          price_difference?: number | null
          price_difference_pct?: number | null
          product_id?: string | null
          recommendation?: string | null
          scan_id?: string | null
        }
        Update: {
          competitor_name?: string
          competitor_price?: number
          competitor_product_name?: string
          competitor_url?: string | null
          created_at?: string
          id?: string
          our_price?: number | null
          price_difference?: number | null
          price_difference_pct?: number | null
          product_id?: string | null
          recommendation?: string | null
          scan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "competitor_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competitor_products_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "competitor_scans"
            referencedColumns: ["id"]
          },
        ]
      }
      competitor_scans: {
        Row: {
          competitor_name: string
          competitor_url: string
          completed_at: string | null
          created_at: string
          id: string
          matches_found: number | null
          status: string
          total_products_found: number | null
        }
        Insert: {
          competitor_name?: string
          competitor_url: string
          completed_at?: string | null
          created_at?: string
          id?: string
          matches_found?: number | null
          status?: string
          total_products_found?: number | null
        }
        Update: {
          competitor_name?: string
          competitor_url?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          matches_found?: number | null
          status?: string
          total_products_found?: number | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          last_name: string
          notes: string | null
          phone: string | null
          state: string | null
          total_orders: number | null
          total_spent: number | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          total_orders?: number | null
          total_spent?: number | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          billing_address: Json | null
          created_at: string
          customer_id: string | null
          id: string
          items: Json | null
          notes: string | null
          order_number: string
          shipping: number | null
          shipping_address: Json | null
          status: string
          subtotal: number | null
          tax: number | null
          total: number
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string
          customer_id?: string | null
          id?: string
          items?: Json | null
          notes?: string | null
          order_number: string
          shipping?: number | null
          shipping_address?: Json | null
          status?: string
          subtotal?: number | null
          tax?: number | null
          total?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          billing_address?: Json | null
          created_at?: string
          customer_id?: string | null
          id?: string
          items?: Json | null
          notes?: string | null
          order_number?: string
          shipping?: number | null
          shipping_address?: Json | null
          status?: string
          subtotal?: number | null
          tax?: number | null
          total?: number
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_colors: {
        Row: {
          created_at: string
          display_order: number | null
          hex_code: string
          id: string
          image_url: string | null
          in_stock: boolean | null
          name: string
          price_adjustment: number | null
          product_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          hex_code: string
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          name: string
          price_adjustment?: number | null
          product_id: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          hex_code?: string
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          name?: string
          price_adjustment?: number | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_colors_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_features: {
        Row: {
          created_at: string
          display_order: number | null
          feature: string
          id: string
          product_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          feature: string
          id?: string
          product_id: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          feature?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_features_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          display_order: number | null
          id: string
          is_primary: boolean | null
          product_id: string
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_primary?: boolean | null
          product_id: string
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_primary?: boolean | null
          product_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_textures: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          in_stock: boolean | null
          name: string
          price_adjustment: number | null
          product_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          name: string
          price_adjustment?: number | null
          product_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          in_stock?: boolean | null
          name?: string
          price_adjustment?: number | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_textures_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variations: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          in_stock: boolean | null
          price_adjustment: number | null
          product_id: string
          sku_suffix: string | null
          value: string
          variation_type: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          in_stock?: boolean | null
          price_adjustment?: number | null
          product_id: string
          sku_suffix?: string | null
          value: string
          variation_type: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          in_stock?: boolean | null
          price_adjustment?: number | null
          product_id?: string
          sku_suffix?: string | null
          value?: string
          variation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          badge: string | null
          brand: string | null
          care_instructions: string | null
          category: string
          compare_at_price: number | null
          created_at: string
          description: string | null
          dimensions: Json | null
          featured: boolean | null
          id: string
          in_stock: boolean | null
          long_description: string | null
          name: string
          price: number
          shipping_info: string | null
          sku: string | null
          slug: string
          stock_quantity: number | null
          subcategory: string | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          badge?: string | null
          brand?: string | null
          care_instructions?: string | null
          category: string
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          dimensions?: Json | null
          featured?: boolean | null
          id?: string
          in_stock?: boolean | null
          long_description?: string | null
          name: string
          price: number
          shipping_info?: string | null
          sku?: string | null
          slug: string
          stock_quantity?: number | null
          subcategory?: string | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          badge?: string | null
          brand?: string | null
          care_instructions?: string | null
          category?: string
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          dimensions?: Json | null
          featured?: boolean | null
          id?: string
          in_stock?: boolean | null
          long_description?: string | null
          name?: string
          price?: number
          shipping_info?: string | null
          sku?: string | null
          slug?: string
          stock_quantity?: number | null
          subcategory?: string | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
