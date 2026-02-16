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
      customers: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          phone: string | null
          address_line1: string | null
          address_line2: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          country: string | null
          notes: string | null
          total_orders: number
          total_spent: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          phone?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string | null
          notes?: string | null
          total_orders?: number
          total_spent?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          phone?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          country?: string | null
          notes?: string | null
          total_orders?: number
          total_spent?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string | null
          status: string
          subtotal: number
          tax: number
          shipping_cost: number
          discount: number
          total: number
          shipping_first_name: string | null
          shipping_last_name: string | null
          shipping_address_line1: string | null
          shipping_address_line2: string | null
          shipping_city: string | null
          shipping_state: string | null
          shipping_zip_code: string | null
          shipping_country: string | null
          shipping_phone: string | null
          billing_same_as_shipping: boolean | null
          payment_method: string | null
          payment_status: string
          tracking_number: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number?: string
          customer_id?: string | null
          status?: string
          subtotal?: number
          tax?: number
          shipping_cost?: number
          discount?: number
          total?: number
          shipping_first_name?: string | null
          shipping_last_name?: string | null
          shipping_address_line1?: string | null
          shipping_address_line2?: string | null
          shipping_city?: string | null
          shipping_state?: string | null
          shipping_zip_code?: string | null
          shipping_country?: string | null
          shipping_phone?: string | null
          billing_same_as_shipping?: boolean | null
          payment_method?: string | null
          payment_status?: string
          tracking_number?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          customer_id?: string | null
          status?: string
          subtotal?: number
          tax?: number
          shipping_cost?: number
          discount?: number
          total?: number
          shipping_first_name?: string | null
          shipping_last_name?: string | null
          shipping_address_line1?: string | null
          shipping_address_line2?: string | null
          shipping_city?: string | null
          shipping_state?: string | null
          shipping_zip_code?: string | null
          shipping_country?: string | null
          shipping_phone?: string | null
          billing_same_as_shipping?: boolean | null
          payment_method?: string | null
          payment_status?: string
          tracking_number?: string | null
          notes?: string | null
          created_at?: string
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
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          product_image: string | null
          quantity: number
          unit_price: number
          total_price: number
          selected_color: string | null
          selected_texture: string | null
          selected_variation: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          product_image?: string | null
          quantity?: number
          unit_price: number
          total_price: number
          selected_color?: string | null
          selected_texture?: string | null
          selected_variation?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_image?: string | null
          quantity?: number
          unit_price?: number
          total_price?: number
          selected_color?: string | null
          selected_texture?: string | null
          selected_variation?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      shop_settings: {
        Row: {
          id: string
          key: string
          value: Json
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value?: Json
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          updated_at?: string
        }
        Relationships: []
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
