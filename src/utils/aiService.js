/**
 * AI Service for generating product content using OpenAI
 * Based on the migrator project's AI generation logic
 */

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini'; // Fast and cost-effective

/**
 * Generate product descriptions and SEO content
 * @param {string} productName - The product name
 * @param {Array<string>} categoryNames - Array of category names
 * @returns {Promise<Object>} - Generated content
 */
export const generateProductContent = async (productName, categoryNames = []) => {
    const categoryList = categoryNames.length > 0 ? categoryNames.join(', ') : 'General';

    const prompt = `Eres un experto en productos químicos industriales para el mercado peruano.

Producto: ${productName}
Categorías: ${categoryList}

Genera contenido profesional y optimizado para SEO en español para este producto químico industrial:

1. DESCRIPCIÓN CORTA (2-3 líneas, máximo 150 caracteres):
   - Concisa y directa
   - Destaca el uso principal
   - Profesional y técnica

2. DESCRIPCIÓN LARGA (3-4 párrafos):
   - Primer párrafo: Qué es y para qué sirve
   - Segundo párrafo: Aplicaciones principales en la industria
   - Tercer párrafo: Beneficios y características técnicas
   - Cuarto párrafo (opcional): Presentaciones disponibles y almacenamiento
   - Tono profesional pero accesible
   - 200-300 palabras total

3. SEO TÍTULO (máximo 60 caracteres):
   - Incluye el nombre del producto
   - Incluye "Perú" o "Lima"
   - Optimizado para búsqueda

4. SEO DESCRIPCIÓN (máximo 160 caracteres):
   - Llamada a la acción
   - Beneficio principal
   - Incluye ubicación (Perú/Lima)

5. KEYWORDS (5-8 palabras clave):
   - Separadas por comas
   - Incluye variaciones del nombre
   - Incluye aplicaciones principales

Responde SOLO con un JSON válido en este formato exacto:
{
  "shortDescription": "...",
  "longDescription": "...",
  "seoTitle": "...",
  "seoDescription": "...",
  "keywords": ["...", "...", "..."]
}`;

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: 'system',
                        content: 'Eres un experto en marketing y SEO para productos químicos industriales en Perú. Respondes siempre con JSON válido.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to generate content');
        }

        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);

        return {
            shortDescription: content.shortDescription,
            longDescription: content.longDescription,
            seoTitle: content.seoTitle,
            seoDescription: content.seoDescription,
            keywords: content.keywords
        };
    } catch (error) {
        console.error('Error generating product content:', error);
        throw error;
    }
};

/**
 * Generate only SEO content (lighter/faster)
 * @param {string} productName - The product name
 * @param {string} shortDescription - Existing short description
 * @returns {Promise<Object>} - Generated SEO content
 */
export const generateSEOContent = async (productName, shortDescription = '') => {
    const prompt = `Eres un experto en SEO para productos químicos industriales en Perú.

Producto: ${productName}
${shortDescription ? `Descripción: ${shortDescription}` : ''}

Genera contenido SEO optimizado en español:

1. SEO TÍTULO (máximo 60 caracteres):
   - Incluye el nombre del producto
   - Incluye "Perú" o "Lima"
   - Optimizado para búsqueda

2. SEO DESCRIPCIÓN (máximo 160 caracteres):
   - Llamada a la acción
   - Beneficio principal
   - Incluye ubicación (Perú/Lima)

3. KEYWORDS (5-8 palabras clave):
   - Separadas por comas
   - Incluye variaciones del nombre
   - Incluye aplicaciones principales

Responde SOLO con un JSON válido en este formato exacto:
{
  "seoTitle": "...",
  "seoDescription": "...",
  "keywords": ["...", "...", "..."]
}`;

    try {
        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    {
                        role: 'system',
                        content: 'Eres un experto en SEO para productos químicos industriales en Perú. Respondes siempre con JSON válido.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 300,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to generate SEO content');
        }

        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);

        return {
            seoTitle: content.seoTitle,
            seoDescription: content.seoDescription,
            keywords: content.keywords
        };
    } catch (error) {
        console.error('Error generating SEO content:', error);
        throw error;
    }
};

/**
 * Estimate cost for AI generation
 * @param {string} type - 'full' or 'seo'
 * @returns {number} - Estimated cost in USD
 */
export const estimateCost = (type = 'full') => {
    const tokensPerRequest = type === 'full' ? 800 : 300;
    const costPerMillionTokens = 0.15; // GPT-4o-mini pricing
    return (tokensPerRequest / 1000000) * costPerMillionTokens;
};
