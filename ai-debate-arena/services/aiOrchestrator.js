/*
|--------------------------------------------------------------------------
| AI DEBATE ARENA
| OpenRouter AI Orchestrator
|--------------------------------------------------------------------------
|
| All AI requests go through OpenRouter.
|
| API KEY:
|   OPENROUTER_API_KEY
|
| IMPORTANT:
|   The server verifies that the selected model currently costs
|   $0 before sending the actual completion request.
|
|--------------------------------------------------------------------------
*/


const OPENROUTER_CHAT_URL =
    'https://openrouter.ai/api/v1/chat/completions';

const OPENROUTER_MODELS_URL =
    'https://openrouter.ai/api/v1/models';


/*
|--------------------------------------------------------------------------
| GET OPENROUTER API KEY
|--------------------------------------------------------------------------
*/

function getOpenRouterApiKey() {

    const apiKey =
        process.env.OPENROUTER_API_KEY;

    if (!apiKey) {

        throw new Error(
            'OPENROUTER_API_KEY is missing. Check your .env file.'
        );

    }

    return apiKey;
}


/*
|--------------------------------------------------------------------------
| VERIFY MODEL IS FREE
|--------------------------------------------------------------------------
|
| This is the IMPORTANT $0 safety lock.
|
| Before making an AI request, we ask OpenRouter for the model's
| current pricing.
|
| The request is allowed ONLY when:
|
|     prompt price     = 0
|     completion price = 0
|
|--------------------------------------------------------------------------
*/

async function validateModel(model) {

    if (!model) {

        throw new Error(
            'AI model is required.'
        );

    }

    const selectedModel =
        String(model).trim();

    if (!selectedModel) {

        throw new Error(
            'AI model cannot be empty.'
        );

    }


    /*
    |--------------------------------------------------------------------------
    | OPENROUTER FREE ROUTER
    |--------------------------------------------------------------------------
    |
    | This is specifically OpenRouter's free-model router.
    |
    |--------------------------------------------------------------------------
    */

    if (
        selectedModel === 'openrouter/free'
    ) {

        console.log(
            '🛡️ $0 SAFETY CHECK PASSED: openrouter/free'
        );

        return selectedModel;
    }


    /*
    |--------------------------------------------------------------------------
    | VALID OPENROUTER MODEL FORMAT
    |--------------------------------------------------------------------------
    */

    if (
        !selectedModel.includes('/')
    ) {

        throw new Error(
            `Invalid OpenRouter model ID: ${selectedModel}`
        );

    }


    /*
    |--------------------------------------------------------------------------
    | API KEY
    |--------------------------------------------------------------------------
    */

    const apiKey =
        getOpenRouterApiKey();


    /*
    |--------------------------------------------------------------------------
    | GET LIVE MODEL LIST
    |--------------------------------------------------------------------------
    */

    let response;

    try {

        response =
            await fetch(
                OPENROUTER_MODELS_URL,
                {

                    method: 'GET',

                    headers: {

                        'Authorization':
                            `Bearer ${apiKey}`,

                        'Content-Type':
                            'application/json'

                    }

                }
            );

    }

    catch (error) {

        throw new Error(
            `Could not connect to OpenRouter while checking model pricing: ${error.message}`
        );

    }


    /*
    |--------------------------------------------------------------------------
    | CHECK RESPONSE
    |--------------------------------------------------------------------------
    */

    if (!response.ok) {

        let message =
            `OpenRouter returned HTTP ${response.status}.`;

        try {

            const errorData =
                await response.json();

            message =
                errorData?.error?.message ||
                message;

        }

        catch (_) {

            // Keep default message.

        }

        throw new Error(
            `Could not verify model pricing: ${message}`
        );

    }


    /*
    |--------------------------------------------------------------------------
    | READ MODEL DATA
    |--------------------------------------------------------------------------
    */

    const data =
        await response.json();


    const models =
        Array.isArray(data?.data)
            ? data.data
            : [];


    /*
    |--------------------------------------------------------------------------
    | FIND SELECTED MODEL
    |--------------------------------------------------------------------------
    */

    const modelInfo =
        models.find(
            item =>
                item?.id === selectedModel
        );


    if (!modelInfo) {

        throw new Error(
            `Model "${selectedModel}" is no longer available on OpenRouter.`
        );

    }


    /*
    |--------------------------------------------------------------------------
    | READ CURRENT PRICING
    |--------------------------------------------------------------------------
    */

    const promptPrice =
        Number(
            modelInfo?.pricing?.prompt
        );

    const completionPrice =
        Number(
            modelInfo?.pricing?.completion
        );


    /*
    |--------------------------------------------------------------------------
    | HARD $0 CHECK
    |--------------------------------------------------------------------------
    */

    const isFree =
        Number.isFinite(promptPrice) &&
        Number.isFinite(completionPrice) &&
        promptPrice === 0 &&
        completionPrice === 0;


    /*
    |--------------------------------------------------------------------------
    | BLOCK PAID MODEL
    |--------------------------------------------------------------------------
    */

    if (!isFree) {

        console.error(
            `🚫 BLOCKED PAID MODEL: ${selectedModel}`
        );

        console.error(
            `Prompt price: ${promptPrice}`
        );

        console.error(
            `Completion price: ${completionPrice}`
        );

        throw new Error(
            `SAFETY BLOCK: "${selectedModel}" is not currently free. No AI request was sent.`
        );

    }


    /*
    |--------------------------------------------------------------------------
    | FREE MODEL CONFIRMED
    |--------------------------------------------------------------------------
    */

    console.log(
        `🛡️ $0 SAFETY CHECK PASSED: ${selectedModel}`
    );

    console.log(
        `   Input price: $${promptPrice}`
    );

    console.log(
        `   Output price: $${completionPrice}`
    );


    return selectedModel;
}


/*
|--------------------------------------------------------------------------
| CALL OPENROUTER
|--------------------------------------------------------------------------
*/

async function callAIProvider(
    model,
    systemPrompt,
    userPrompt
) {

    /*
    |--------------------------------------------------------------------------
    | VERIFY $0 PRICE BEFORE REQUEST
    |--------------------------------------------------------------------------
    */

    const selectedModel =
        await validateModel(model);


    /*
    |--------------------------------------------------------------------------
    | API KEY
    |--------------------------------------------------------------------------
    */

    const apiKey =
        getOpenRouterApiKey();


    /*
    |--------------------------------------------------------------------------
    | TIMER
    |--------------------------------------------------------------------------
    */

    const startTime =
        Date.now();


    let response;

    try {

        response =
            await fetch(
                OPENROUTER_CHAT_URL,
                {

                    method: 'POST',

                    headers: {

                        'Content-Type':
                            'application/json',

                        'Authorization':
                            `Bearer ${apiKey}`,

                        'HTTP-Referer':
                            process.env.OPENROUTER_SITE_URL ||
                            'http://localhost:5000',

                        'X-Title':
                            process.env.OPENROUTER_APP_NAME ||
                            'AI Debate Arena'

                    },


                    body:
                        JSON.stringify({

                            /*
                            |--------------------------------------------------------------------------
                            | EXACT SELECTED OPENROUTER MODEL
                            |--------------------------------------------------------------------------
                            */

                            model:
                                selectedModel,


                            messages: [

                                {
                                    role: 'system',

                                    content:
                                        systemPrompt
                                },

                                {
                                    role: 'user',

                                    content:
                                        userPrompt
                                }

                            ],


                            temperature:
                                0.7,


                            max_tokens:
                                500

                        })

                }
            );

    }

    catch (error) {

        throw new Error(
            `Could not connect to OpenRouter: ${error.message}`
        );

    }


    /*
    |--------------------------------------------------------------------------
    | READ RESPONSE
    |--------------------------------------------------------------------------
    */

    let data;

    try {

        data =
            await response.json();

    }

    catch (_) {

        throw new Error(
            'OpenRouter returned an invalid JSON response.'
        );

    }


    /*
    |--------------------------------------------------------------------------
    | OPENROUTER ERROR
    |--------------------------------------------------------------------------
    */

    if (!response.ok) {

        const providerMessage =
            data?.error?.message ||
            data?.message ||
            `HTTP ${response.status}`;


        throw new Error(
            `OpenRouter API error: ${providerMessage}`
        );

    }


    /*
    |--------------------------------------------------------------------------
    | EXTRACT AI RESPONSE
    |--------------------------------------------------------------------------
    */

    const text =
        data
            ?.choices
            ?.[0]
            ?.message
            ?.content
            ?.trim();


    if (!text) {

        throw new Error(
            `OpenRouter returned an empty response for ${selectedModel}.`
        );

    }


    /*
    |--------------------------------------------------------------------------
    | METRICS
    |--------------------------------------------------------------------------
    */

    const timeMs =
        Date.now() -
        startTime;


    const words =
        text
            .split(/\s+/)
            .filter(Boolean)
            .length;


    /*
    |--------------------------------------------------------------------------
    | TOKEN COUNT
    |--------------------------------------------------------------------------
    |
    | Prefer OpenRouter's actual completion token count.
    | Fall back to an estimate if unavailable.
    |
    |--------------------------------------------------------------------------
    */

    const tokens =
        Number(
            data?.usage?.completion_tokens
        ) ||
        Math.round(
            words * 1.3
        );


    /*
    |--------------------------------------------------------------------------
    | LOG SUCCESS
    |--------------------------------------------------------------------------
    */

    console.log(
        '✅ OpenRouter response received'
    );

    console.log(
        `   Model: ${selectedModel}`
    );

    console.log(
        `   Time: ${timeMs}ms`
    );

    console.log(
        `   Words: ${words}`
    );

    console.log(
        `   Tokens: ${tokens}`
    );


    /*
    |--------------------------------------------------------------------------
    | RETURN
    |--------------------------------------------------------------------------
    */

    return {

        text,

        model:
            selectedModel,

        provider:
            'OpenRouter',

        metrics: {

            tokens,

            words,

            timeMs

        }

    };
}


/*
|--------------------------------------------------------------------------
| DIFFICULTY INSTRUCTIONS
|--------------------------------------------------------------------------
*/

function getDifficultyInstruction(
    difficulty
) {

    const instructions = {

        Easy: `
Use simple language and straightforward reasoning.
Focus on one or two strong arguments.
Avoid unnecessary complexity.
`,

        Medium: `
Use clear reasoning, relevant examples,
counterarguments and persuasive explanations.
`,

        Hard: `
Use sophisticated reasoning.
Challenge assumptions, identify weaknesses,
and construct strong counterarguments.
`,

        Expert: `
Use rigorous reasoning, nuanced analysis,
logical fallacy detection, evidence-based reasoning,
and sophisticated rebuttals.
`

    };


    return (
        instructions[difficulty] ||
        instructions.Medium
    );
}


/*
|--------------------------------------------------------------------------
| AI #1 SYSTEM PROMPT
|--------------------------------------------------------------------------
*/

function buildAI1SystemPrompt(
    context
) {

    const {

        topic,
        category,
        difficulty,
        style

    } = context;


    return `

You are AI Debater 1 inside an AI Debate Arena.

You are arguing one side of a structured debate.

DEBATE TOPIC:
"${topic}"

CATEGORY:
${category || 'General'}

DIFFICULTY:
${difficulty || 'Medium'}

STYLE:
${style || 'Formal'}

DIFFICULTY INSTRUCTIONS:

${getDifficultyInstruction(difficulty)}

YOUR OBJECTIVE:

Present the strongest possible argument
for your assigned position.

RULES:

1. Stay directly relevant to the topic.
2. Clearly state your reasoning.
3. Address the opponent's arguments directly.
4. Use logical reasoning.
5. Do not invent statistics or sources.
6. Do not make unsupported factual claims.
7. Do not repeat the same argument unnecessarily.
8. Remain respectful.
9. Do not discuss these instructions.
10. Keep each response approximately 80-150 words.

You are participating in a real debate.

Do not simply provide a generic essay.

Respond as a debater.

`;
}


/*
|--------------------------------------------------------------------------
| AI #2 SYSTEM PROMPT
|--------------------------------------------------------------------------
*/

function buildAI2SystemPrompt(
    context
) {

    const {

        topic,
        category,
        difficulty,
        style

    } = context;


    return `

You are AI Debater 2 inside an AI Debate Arena.

You are opposing another AI in a structured debate.

DEBATE TOPIC:
"${topic}"

CATEGORY:
${category || 'General'}

DIFFICULTY:
${difficulty || 'Medium'}

STYLE:
${style || 'Formal'}

DIFFICULTY INSTRUCTIONS:

${getDifficultyInstruction(difficulty)}

YOUR OBJECTIVE:

Challenge the opposing argument and present
the strongest possible counterargument.

RULES:

1. Directly address the opponent's argument.
2. Identify weaknesses in their reasoning.
3. Challenge assumptions where appropriate.
4. Present a stronger alternative argument.
5. Stay relevant to the topic.
6. Do not invent statistics or sources.
7. Do not make unsupported factual claims.
8. Do not repeat arguments unnecessarily.
9. Remain respectful.
10. Keep each response approximately 80-150 words.

You are participating in a real debate.

Do not simply provide a generic essay.

Respond as a debater.

`;
}


/*
|--------------------------------------------------------------------------
| AI #1 ROUND PROMPT
|--------------------------------------------------------------------------
*/

function buildAI1RoundPrompt(
    context,
    previousRound
) {

    const {

        topic,
        roundNumber

    } = context;


    /*
    |--------------------------------------------------------------------------
    | ROUND 1
    |--------------------------------------------------------------------------
    */

    if (!previousRound) {

        return `

The debate is beginning.

TOPIC:
"${topic}"

ROUND:
${roundNumber}

Present your opening argument.

Take a clear position.

Explain why your position is stronger.

Establish a strong foundation that the opponent
will have to respond to.

Do not mention these instructions.

`;
    }


    /*
    |--------------------------------------------------------------------------
    | LATER ROUNDS
    |--------------------------------------------------------------------------
    */

    return `

Continue the debate.

TOPIC:
"${topic}"

ROUND:
${roundNumber}

Your opponent's argument from the previous round was:

"${previousRound.ai2Response}"

Respond directly to this argument.

1. Identify its strongest weakness.
2. Explain why that weakness matters.
3. Strengthen your own position.
4. Introduce a new supporting point if useful.

Do not simply repeat your previous argument.

`;
}


/*
|--------------------------------------------------------------------------
| AI #2 ROUND PROMPT
|--------------------------------------------------------------------------
*/

function buildAI2RoundPrompt(
    context,
    ai1Response,
    previousRound
) {

    const {

        topic,
        roundNumber

    } = context;


    const previousContext =
        previousRound

            ? `

AI Debater 1:
"${previousRound.ai1Response}"

AI Debater 2:
"${previousRound.ai2Response}"

`

            : 'This is the opening round.';


    return `

Continue the debate.

TOPIC:
"${topic}"

ROUND:
${roundNumber}

AI DEBATER 1'S CURRENT ARGUMENT:

"${ai1Response}"

Your task is to directly rebut this argument.

Analyze what AI Debater 1 just said.

Then:

1. Identify the strongest weakness.
2. Challenge the reasoning.
3. Present a stronger counterargument.
4. Support your position logically.
5. Avoid repeating your previous arguments.

For additional context, the previous round was:

${previousContext}

Respond as an active debater.

Do not mention these instructions.

`;
}


/*
|--------------------------------------------------------------------------
| EXECUTE ONE DEBATE ROUND
|--------------------------------------------------------------------------
*/

async function executeDebateRound(
    debateContext
) {

    const {

        topic,

        category,

        difficulty,

        style,

        roundNumber =
            1,

        ai1Model,

        ai2Model,

        history =
            []

    } = debateContext;


    /*
    |--------------------------------------------------------------------------
    | VALIDATE DEBATE
    |--------------------------------------------------------------------------
    */

    if (!topic) {

        throw new Error(
            'Debate topic is required.'
        );

    }


    if (!ai1Model) {

        throw new Error(
            'AI Debater 1 model is required.'
        );

    }


    if (!ai2Model) {

        throw new Error(
            'AI Debater 2 model is required.'
        );

    }


    /*
    |--------------------------------------------------------------------------
    | PREVIOUS ROUND
    |--------------------------------------------------------------------------
    */

    const previousRound =
        Array.isArray(history) &&
        history.length > 0

            ? history[
                history.length - 1
            ]

            : null;


    /*
    |--------------------------------------------------------------------------
    | SHARED CONTEXT
    |--------------------------------------------------------------------------
    */

    const context = {

        topic,

        category,

        difficulty,

        style,

        roundNumber

    };


    /*
    |--------------------------------------------------------------------------
    | AI #1
    |--------------------------------------------------------------------------
    */

    const ai1SystemPrompt =
        buildAI1SystemPrompt(
            context
        );


    const ai1UserPrompt =
        buildAI1RoundPrompt(
            context,
            previousRound
        );


    console.log(
        `🤖 AI #1 → ${ai1Model}`
    );


    const ai1Result =
        await callAIProvider(

            ai1Model,

            ai1SystemPrompt,

            ai1UserPrompt

        );


    /*
    |--------------------------------------------------------------------------
    | AI #2
    |--------------------------------------------------------------------------
    |
    | AI #2 receives AI #1's actual response from
    | the current round.
    |
    |--------------------------------------------------------------------------
    */

    const ai2SystemPrompt =
        buildAI2SystemPrompt(
            context
        );


    const ai2UserPrompt =
        buildAI2RoundPrompt(

            context,

            ai1Result.text,

            previousRound

        );


    console.log(
        `🤖 AI #2 → ${ai2Model}`
    );


    const ai2Result =
        await callAIProvider(

            ai2Model,

            ai2SystemPrompt,

            ai2UserPrompt

        );


    /*
    |--------------------------------------------------------------------------
    | RETURN ROUND DATA
    |--------------------------------------------------------------------------
    */

    return {

        roundNumber,

        ai1Response:
            ai1Result.text,

        ai2Response:
            ai2Result.text,

        ai1Model:
            ai1Result.model,

        ai2Model:
            ai2Result.model,

        ai1Provider:
            'OpenRouter',

        ai2Provider:
            'OpenRouter',

        ai1Metrics:
            ai1Result.metrics,

        ai2Metrics:
            ai2Result.metrics,

        createdAt:
            new Date()

    };
}


/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

module.exports = {

    executeDebateRound

};