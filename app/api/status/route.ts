export async function GET(){return Response.json({ai:!!(process.env.OPENAI_API_KEY&&process.env.OPENAI_MODEL),maps:!!process.env.GOOGLE_MAPS_API_KEY},{headers:{'Cache-Control':'no-store'}});}
