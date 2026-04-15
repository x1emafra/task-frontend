import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  // Manejo de preflight request (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Configura el cliente de Supabase usando las variables de entorno de Edge Runtime
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { 
        global: { 
          // Reenviamos el header de Authorization para respetar RLS y saber qué usuario hace la petición
          headers: { Authorization: req.headers.get('Authorization')! } 
        } 
      }
    )

    // Parsear los parámetros de la solicitud
    const body = await req.json()
    const { task_id, email } = body

    if (!task_id || !email) {
      throw new Error('Faltan parámetros requeridos: task_id o email')
    }

    // Insertar el registro en la tabla shared_tasks
    const { data, error } = await supabaseClient
      .from('shared_tasks')
      .insert({
        task_id: task_id,
        user_email: email
      })
      .select()

    if (error) {
       console.error("Error al insertar en shared_tasks", error)
       throw error
    }

    // Retorna una respuesta exitosa
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Error en la Edge Function", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400, // Devolvemos 400 bad request en lugar de 500 para evitar que el navegador devuelva FetchError silencioso a veces
    })
  }
})
