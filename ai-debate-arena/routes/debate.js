const express = require('express');

const router = express.Router();

<<<<<<< HEAD
// Start a new debate
router.post('/start', async (req, res) => {
  try {
    const { topic, category, difficulty, style, ai1Model, ai2Model, totalRounds } = req.body;
    const debate = await Debate.create({
      topic, category, difficulty, style, ai1Model, ai2Model, totalRounds,
      status: 'in-progress', rounds: []
    });
    res.json({ debateId: debate._id, status: 'started' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Run a debate round
router.post('/:id/round', async (req, res) => {
  try {
    const { roundNumber } = req.body;
    const debate = await Debate.findById(req.params.id);
    if (!debate) return res.status(404).json({ error: 'Debate not found' });
=======

const Debate =
    require('../models/Debate');
>>>>>>> e6f8146 (Connect debate arena to OpenRouter)


const {
    executeDebateRound
} =
    require('../services/aiOrchestrator');


/*
|--------------------------------------------------------------------------
| OPENROUTER CONFIGURATION
|--------------------------------------------------------------------------
*/

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
            'OPENROUTER_API_KEY is not configured.'
        );

    }


<<<<<<< HEAD
// Get leaderboard stats
router.get('/leaderboard', async (req, res) => {
  try {
    const debates = await Debate.find({ status: 'completed' });
    const stats = {};
=======
    return apiKey;
>>>>>>> e6f8146 (Connect debate arena to OpenRouter)

}


/*
|--------------------------------------------------------------------------
| FETCH CURRENT FREE OPENROUTER MODELS
|--------------------------------------------------------------------------
|
| We DO NOT hard-code GPT / Claude / Llama here.
|
| OpenRouter's available free models can change.
|
| This function asks OpenRouter for the current
| model list and keeps models whose prompt and
| completion prices are zero.
|
|--------------------------------------------------------------------------
*/

async function fetchFreeOpenRouterModels() {

    const apiKey =
        getOpenRouterApiKey();


    const response =
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


    if (!response.ok) {

        let errorMessage =
            `OpenRouter returned HTTP ${response.status}`;


        try {

            const errorData =
                await response.json();


            errorMessage =
                errorData?.error?.message ||
                errorMessage;

        }

        catch (_) {

            // Keep default error message.

        }


        throw new Error(
            errorMessage
        );

    }


    const data =
        await response.json();


    const models =
        Array.isArray(data?.data)
            ? data.data
            : [];


    /*
    |--------------------------------------------------------------------------
    | FILTER FREE MODELS
    |--------------------------------------------------------------------------
    */

    const freeModels =
        models
            .filter(model => {

                const promptPrice =
                    Number(
                        model?.pricing?.prompt
                    );


                const completionPrice =
                    Number(
                        model?.pricing?.completion
                    );


                return (
                    promptPrice === 0 &&
                    completionPrice === 0
                );

            })
            .map(model => ({

                id:
                    model.id,

                name:
                    model.name ||
                    model.id,

                description:
                    model.description ||
                    '',

                contextLength:
                    model.context_length ||
                    null

            }))
            .sort(
                (a, b) =>
                    a.name.localeCompare(
                        b.name
                    )
            );


    /*
    |--------------------------------------------------------------------------
    | ALWAYS INCLUDE OPENROUTER FREE ROUTER
    |--------------------------------------------------------------------------
    |
    | This is OpenRouter's automatic free-model
    | router.
    |
    |--------------------------------------------------------------------------
    */

    const hasFreeRouter =
        freeModels.some(
            model =>
                model.id === 'openrouter/free'
        );


    if (!hasFreeRouter) {

        freeModels.unshift({

            id:
                'openrouter/free',

            name:
                'OpenRouter Free Router',

            description:
                'Automatically selects an available free model.',

            contextLength:
                null

        });

    }


    return freeModels;

}


/*
|--------------------------------------------------------------------------
| GET AVAILABLE FREE MODELS
|--------------------------------------------------------------------------
|
| Frontend:
|
| GET /api/debate/models
|
|--------------------------------------------------------------------------
*/

router.get(
    '/models',
    async (req, res) => {

        try {

            console.log(
                '🔎 Loading free OpenRouter models...'
            );


            const models =
                await fetchFreeOpenRouterModels();


            console.log(
                `✅ Found ${models.length} free OpenRouter models`
            );


            return res.json({

                success:
                    true,

                provider:
                    'OpenRouter',

                models

            });

        }

        catch (error) {

            console.error(
                '❌ Failed to load OpenRouter models:',
                error.message
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    error.message ||
                    'Unable to load OpenRouter models.'

            });

        }

    }
);


/*
|--------------------------------------------------------------------------
| START DEBATE
|--------------------------------------------------------------------------
*/

router.post(
    '/start',
    async (req, res) => {

        try {

            const {

                topic,

                category =
                    'General',

                difficulty =
                    'Medium',

                style =
                    'Formal',

                ai1Model,

                ai2Model,

                totalRounds =
                    4

            } =
                req.body;


            /*
            |--------------------------------------------------------------------------
            | LOG REQUEST
            |--------------------------------------------------------------------------
            */

            console.log(
                '🚀 Starting debate...'
            );

            console.log(
                'Topic:',
                topic
            );

            console.log(
                'AI 1:',
                ai1Model
            );

            console.log(
                'AI 2:',
                ai2Model
            );


            /*
            |--------------------------------------------------------------------------
            | VALIDATE TOPIC
            |--------------------------------------------------------------------------
            */

            if (
                !topic ||
                typeof topic !== 'string' ||
                !topic.trim()
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        'Please enter a debate topic.'

                });

            }


            /*
            |--------------------------------------------------------------------------
            | VALIDATE MODELS EXIST
            |--------------------------------------------------------------------------
            */

            if (
                !ai1Model ||
                !ai2Model
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        'Please select two AI models.'

                });

            }


            /*
            |--------------------------------------------------------------------------
            | FETCH CURRENT FREE MODELS
            |--------------------------------------------------------------------------
            */

            const freeModels =
                await fetchFreeOpenRouterModels();


            const availableModelIds =
                new Set(
                    freeModels.map(
                        model =>
                            model.id
                    )
                );


            /*
            |--------------------------------------------------------------------------
            | VALIDATE AI #1
            |--------------------------------------------------------------------------
            */

            if (
                !availableModelIds.has(
                    ai1Model
                )
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        `AI Model #1 is not currently available as a free OpenRouter model: ${ai1Model}`

                });

            }


            /*
            |--------------------------------------------------------------------------
            | VALIDATE AI #2
            |--------------------------------------------------------------------------
            */

            if (
                !availableModelIds.has(
                    ai2Model
                )
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        `AI Model #2 is not currently available as a free OpenRouter model: ${ai2Model}`

                });

            }


            /*
            |--------------------------------------------------------------------------
            | VALIDATE ROUNDS
            |--------------------------------------------------------------------------
            */

            const rounds =
                Number(totalRounds);


            if (
                ![2, 4, 6].includes(
                    rounds
                )
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        'Rounds must be 2, 4, or 6.'

                });

            }


            /*
            |--------------------------------------------------------------------------
            | CREATE DEBATE
            |--------------------------------------------------------------------------
            */

            const debate =
                await Debate.create({

                    topic:
                        topic.trim(),

                    category,

                    difficulty,

                    style,

                    ai1Model,

                    ai2Model,

                    totalRounds:
                        rounds,

                    status:
                        'in-progress',

                    rounds:
                        []

                });


            /*
            |--------------------------------------------------------------------------
            | SUCCESS
            |--------------------------------------------------------------------------
            */

            console.log(
                `✅ Debate created: ${debate._id}`
            );


            return res.status(201).json({

                success:
                    true,

                debateId:
                    debate._id.toString(),

                status:
                    'started',

                provider:
                    'OpenRouter',

                ai1Model,

                ai2Model,

                totalRounds:
                    rounds

            });

        }

        catch (error) {

            console.error(
                '❌ Start debate error:',
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    error.message ||
                    'Failed to start debate.'

            });

        }

    }
);


/*
|--------------------------------------------------------------------------
| RUN ONE DEBATE ROUND
|--------------------------------------------------------------------------
*/

router.post(
    '/:id/round',
    async (req, res) => {

        try {

            const {
                roundNumber
            } =
                req.body;


            /*
            |--------------------------------------------------------------------------
            | VALIDATE ROUND NUMBER
            |--------------------------------------------------------------------------
            */

            const currentRound =
                Number(
                    roundNumber
                );


            if (
                !Number.isInteger(
                    currentRound
                ) ||
                currentRound < 1
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        'A valid round number is required.'

                });

            }


            /*
            |--------------------------------------------------------------------------
            | FIND DEBATE
            |--------------------------------------------------------------------------
            */

            const debate =
                await Debate.findById(
                    req.params.id
                );


            if (!debate) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        'Debate not found.'

                });

            }


            /*
            |--------------------------------------------------------------------------
            | PREVENT EXTRA ROUNDS
            |--------------------------------------------------------------------------
            */

            if (
                currentRound >
                debate.totalRounds
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        'This debate has already reached its maximum rounds.'

                });

            }


            /*
            |--------------------------------------------------------------------------
            | MAKE SURE BOTH MODELS EXIST
            |--------------------------------------------------------------------------
            */

            if (
                !debate.ai1Model ||
                !debate.ai2Model
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        'This debate does not contain two AI models.'

                });

            }


            /*
            |--------------------------------------------------------------------------
            | LOG ROUND
            |--------------------------------------------------------------------------
            */

            console.log(
                `⚔️ Debate ${debate._id} — Round ${currentRound}`
            );

            console.log(
                `AI 1: ${debate.ai1Model}`
            );

            console.log(
                `AI 2: ${debate.ai2Model}`
            );


            /*
            |--------------------------------------------------------------------------
            | EXECUTE ROUND
            |--------------------------------------------------------------------------
            */

            const roundData =
                await executeDebateRound({

                    topic:
                        debate.topic,

                    category:
                        debate.category,

                    difficulty:
                        debate.difficulty,

                    style:
                        debate.style,

                    roundNumber:
                        currentRound,

                    ai1Model:
                        debate.ai1Model,

                    ai2Model:
                        debate.ai2Model,

                    history:
                        debate.rounds

                });


            /*
            |--------------------------------------------------------------------------
            | SAVE ROUND
            |--------------------------------------------------------------------------
            */

            debate.rounds.push(
                roundData
            );


            /*
            |--------------------------------------------------------------------------
            | COMPLETE DEBATE
            |--------------------------------------------------------------------------
            */

            if (
                currentRound >=
                debate.totalRounds
            ) {

                debate.status =
                    'completed';

            }


            await debate.save();


            /*
            |--------------------------------------------------------------------------
            | RESPONSE
            |--------------------------------------------------------------------------
            */

            return res.json({

                success:
                    true,

                ...roundData

            });

        }

        catch (error) {

            console.error(
                '❌ Debate round error:',
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    error.message ||
                    'Failed to execute debate round.'

            });

        }

    }
);


/*
|--------------------------------------------------------------------------
| LEADERBOARD
|--------------------------------------------------------------------------
*/

router.get(
    '/leaderboard',
    async (req, res) => {

        try {

            const debates =
                await Debate.find({

                    status:
                        'completed'

                });


            const stats = {};


            /*
            |--------------------------------------------------------------------------
            | BUILD MODEL STATISTICS
            |--------------------------------------------------------------------------
            */

            debates.forEach(
                debate => {

                    const models = [

                        debate.ai1Model,

                        debate.ai2Model

                    ];


                    models.forEach(
                        model => {

                            if (!model) {

                                return;

                            }


                            if (!stats[model]) {

                                stats[model] = {

                                    wins:
                                        0,

                                    matches:
                                        0

                                };

                            }


                            stats[model]
                                .matches++;

                        }
                    );


                    /*
                    |--------------------------------------------------------------------------
                    | WINNER
                    |--------------------------------------------------------------------------
                    */

                    if (
                        debate.winner &&
                        debate.winner !== 'Draw'
                    ) {

                        if (
                            stats[
                                debate.winner
                            ]
                        ) {

                            stats[
                                debate.winner
                            ].wins++;

                        }

                    }

                }
            );


            /*
            |--------------------------------------------------------------------------
            | CREATE LEADERBOARD
            |--------------------------------------------------------------------------
            */

            const leaderboard =

                Object.keys(stats)

                    .map(
                        model => {

                            const matches =
                                stats[
                                    model
                                ].matches;


                            const wins =
                                stats[
                                    model
                                ].wins;


                            return {

                                model,

                                wins,

                                matches,

                                winRate:
                                    matches > 0

                                        ? Math.round(
                                            (
                                                wins /
                                                matches
                                            ) *
                                            100
                                        )

                                        : 0

                            };

                        }
                    )

                    .sort(
                        (a, b) =>
                            b.winRate -
                            a.winRate
                    );


            return res.json({

                success:
                    true,

                leaderboard

            });

        }

        catch (error) {

            console.error(
                '❌ Leaderboard error:',
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    error.message ||
                    'Failed to load leaderboard.'

            });

        }

    }
);


/*
|--------------------------------------------------------------------------
| EXPORT ROUTER
|--------------------------------------------------------------------------
*/

module.exports =
    router;