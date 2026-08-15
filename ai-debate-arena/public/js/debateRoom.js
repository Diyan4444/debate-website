/*
|--------------------------------------------------------------------------
| AI DEBATE ROOM
|--------------------------------------------------------------------------
| Frontend for the AI Debate Arena.
|
| All AI models are accessed through OpenRouter.
| The available FREE models are loaded dynamically
| from the backend.
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| OPENROUTER MODELS
|--------------------------------------------------------------------------
|
| This is populated dynamically from:
|
| GET /api/debate/models
|
|--------------------------------------------------------------------------
*/

let OPENROUTER_MODELS = [];


/*
|--------------------------------------------------------------------------
| RENDER DEBATE ROOM
|--------------------------------------------------------------------------
*/

function renderDebateRoom() {

    return `
        <div class="max-w-7xl mx-auto py-10 px-6 w-full flex flex-col gap-8 flex-grow">

            <!-- =========================================================
                 SETUP PANEL
            ========================================================== -->

            <div
                id="setupPanel"
                class="glass-card rounded-3xl p-8 border border-slate-800 shadow-2xl"
            >

                <h2 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">

                    <i class="fa-solid fa-sliders text-cyan-400"></i>

                    Configure Debate Matchup

                </h2>


                <!-- =====================================================
                     TOPIC / STYLE / ROUNDS
                ====================================================== -->

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">


                    <!-- TOPIC -->

                    <div class="space-y-2 lg:col-span-2">

                        <label class="text-sm font-semibold text-slate-300">
                            Debate Topic
                        </label>

                        <input
                            type="text"
                            id="topicInput"
                            placeholder="e.g., Should AGI be open-sourced?"
                            class="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition"
                        >

                    </div>


                    <!-- STYLE -->

                    <div class="space-y-2">

                        <label class="text-sm font-semibold text-slate-300">
                            Debate Style
                        </label>

                        <select
                            id="styleSelect"
                            class="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition"
                        >

                            <option value="Formal">
                                Formal & Logical
                            </option>

                            <option value="Aggressive">
                                Aggressive & Critical
                            </option>

                            <option value="Scientific">
                                Scientific & Empirical
                            </option>

                            <option value="Philosophical">
                                Philosophical
                            </option>

                        </select>

                    </div>


                    <!-- ROUNDS -->

                    <div class="space-y-2">

                        <label class="text-sm font-semibold text-slate-300">
                            Rounds
                        </label>

                        <select
                            id="roundsSelect"
                            class="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition"
                        >

                            <option value="2">
                                2 Rounds
                            </option>

                            <option value="4" selected>
                                4 Rounds
                            </option>

                            <option value="6">
                                6 Rounds
                            </option>

                        </select>

                    </div>

                </div>


                <!-- =====================================================
                     AI MODELS
                ====================================================== -->

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">


                    <!-- =================================================
                         AI 1
                    ================================================== -->

                    <div class="space-y-2">

                        <label class="text-sm font-semibold text-cyan-400">

                            <i class="fa-solid fa-microchip mr-1"></i>

                            AI Model #1 — Proponent

                        </label>


                        <select
                            id="ai1Select"
                            class="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 transition"
                            disabled
                        >

                            <option value="">
                                Loading free models...
                            </option>

                        </select>


                        <p class="text-xs text-slate-500">

                            <i class="fa-solid fa-circle-check text-emerald-400 mr-1"></i>

                            Free model through OpenRouter

                        </p>

                    </div>


                    <!-- =================================================
                         AI 2
                    ================================================== -->

                    <div class="space-y-2">

                        <label class="text-sm font-semibold text-indigo-400">

                            <i class="fa-solid fa-microchip mr-1"></i>

                            AI Model #2 — Opponent

                        </label>


                        <select
                            id="ai2Select"
                            class="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                            disabled
                        >

                            <option value="">
                                Loading free models...
                            </option>

                        </select>


                        <p class="text-xs text-slate-500">

                            <i class="fa-solid fa-circle-check text-emerald-400 mr-1"></i>

                            Free model through OpenRouter

                        </p>

                    </div>

                </div>


                <!-- =====================================================
                     START BUTTON
                ====================================================== -->

                <button
                    id="startDebateButton"
                    onclick="startDebateSession()"
                    disabled
                    class="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-lg shadow-xl shadow-cyan-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >

                    <i class="fa-solid fa-play mr-2"></i>

                    Start Live Debate Match

                </button>


                <!-- MODEL STATUS -->

                <div
                    id="modelLoadingStatus"
                    class="text-center text-xs text-slate-500 mt-4"
                >

                    <i class="fa-solid fa-circle-notch fa-spin mr-1"></i>

                    Connecting to OpenRouter...

                </div>

            </div>


            <!-- =========================================================
                 LIVE ARENA
            ========================================================== -->

            <div
                id="arenaContainer"
                class="hidden grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow"
            >


                <!-- =====================================================
                     AI 1
                ====================================================== -->

                <div
                    class="glass-card rounded-3xl p-6 border border-cyan-500/30 flex flex-col h-[600px]"
                >

                    <div
                        class="flex items-center justify-between pb-4 border-b border-slate-800"
                    >

                        <div class="flex items-center space-x-3">

                            <div
                                class="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold"
                            >
                                AI 1
                            </div>


                            <div>

                                <h3
                                    id="ai1Title"
                                    class="font-bold text-lg text-white"
                                >
                                    Model 1
                                </h3>


                                <p
                                    id="ai1Provider"
                                    class="text-xs text-slate-500"
                                >
                                    OpenRouter
                                </p>

                            </div>

                        </div>


                        <span
                            id="ai1Status"
                            class="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-400"
                        >
                            Waiting...
                        </span>

                    </div>


                    <div
                        id="ai1ChatLog"
                        class="flex-grow overflow-y-auto py-4 space-y-4 pr-2 font-mono text-sm text-slate-300"
                    ></div>

                </div>


                <!-- =====================================================
                     AI 2
                ====================================================== -->

                <div
                    class="glass-card rounded-3xl p-6 border border-indigo-500/30 flex flex-col h-[600px]"
                >

                    <div
                        class="flex items-center justify-between pb-4 border-b border-slate-800"
                    >

                        <div class="flex items-center space-x-3">

                            <div
                                class="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold"
                            >
                                AI 2
                            </div>


                            <div>

                                <h3
                                    id="ai2Title"
                                    class="font-bold text-lg text-white"
                                >
                                    Model 2
                                </h3>


                                <p
                                    id="ai2Provider"
                                    class="text-xs text-slate-500"
                                >
                                    OpenRouter
                                </p>

                            </div>

                        </div>


                        <span
                            id="ai2Status"
                            class="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-400"
                        >
                            Waiting...
                        </span>

                    </div>


                    <div
                        id="ai2ChatLog"
                        class="flex-grow overflow-y-auto py-4 space-y-4 pr-2 font-mono text-sm text-slate-300"
                    ></div>

                </div>

            </div>

        </div>
    `;
}


/*
|--------------------------------------------------------------------------
| LOAD OPENROUTER FREE MODELS
|--------------------------------------------------------------------------
*/

async function loadOpenRouterModels() {

    const ai1Select =
        document.getElementById('ai1Select');


    const ai2Select =
        document.getElementById('ai2Select');


    const startButton =
        document.getElementById('startDebateButton');


    const loadingStatus =
        document.getElementById('modelLoadingStatus');


    if (
        !ai1Select ||
        !ai2Select
    ) {

        return;

    }


    try {

        if (loadingStatus) {

            loadingStatus.innerHTML = `

                <i class="fa-solid fa-circle-notch fa-spin mr-1"></i>

                Loading free OpenRouter models...

            `;

        }


        /*
        |--------------------------------------------------------------------------
        | REQUEST MODELS FROM OUR BACKEND
        |--------------------------------------------------------------------------
        */

        const response =
            await fetch(
                `${API_BASE}/debate/models`
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                'Unable to load OpenRouter models.'
            );

        }


        const models =
            Array.isArray(data.models)
                ? data.models
                : [];


        if (!models.length) {

            throw new Error(
                'No free OpenRouter models are currently available.'
            );

        }


        /*
        |--------------------------------------------------------------------------
        | SAVE MODELS
        |--------------------------------------------------------------------------
        */

        OPENROUTER_MODELS =
            models;


        /*
        |--------------------------------------------------------------------------
        | CLEAR OLD OPTIONS
        |--------------------------------------------------------------------------
        */

        ai1Select.innerHTML = '';

        ai2Select.innerHTML = '';


        /*
        |--------------------------------------------------------------------------
        | ADD OPTIONS SAFELY
        |--------------------------------------------------------------------------
        */

        models.forEach(
            (model, index) => {

                const option1 =
                    document.createElement(
                        'option'
                    );


                option1.value =
                    model.id;


                option1.textContent =
                    `🟢 ${model.name}`;


                option1.title =
                    model.description ||
                    model.id;


                ai1Select.appendChild(
                    option1
                );


                const option2 =
                    document.createElement(
                        'option'
                    );


                option2.value =
                    model.id;


                option2.textContent =
                    `🟢 ${model.name}`;


                option2.title =
                    model.description ||
                    model.id;


                ai2Select.appendChild(
                    option2
                );

            }
        );


        /*
        |--------------------------------------------------------------------------
        | DEFAULT MODEL SELECTION
        |--------------------------------------------------------------------------
        */

        if (models.length > 1) {

            ai1Select.selectedIndex =
                0;


            ai2Select.selectedIndex =
                1;

        }


        /*
        |--------------------------------------------------------------------------
        | ENABLE SELECTORS
        |--------------------------------------------------------------------------
        */

        ai1Select.disabled =
            false;


        ai2Select.disabled =
            false;


        /*
        |--------------------------------------------------------------------------
        | ENABLE START BUTTON
        |--------------------------------------------------------------------------
        */

        if (startButton) {

            startButton.disabled =
                false;

        }


        /*
        |--------------------------------------------------------------------------
        | SUCCESS MESSAGE
        |--------------------------------------------------------------------------
        */

        if (loadingStatus) {

            loadingStatus.innerHTML = `

                <i class="fa-solid fa-circle-check text-emerald-400 mr-1"></i>

                ${models.length} free models available through OpenRouter

            `;

        }


        console.log(
            `✅ Loaded ${models.length} free OpenRouter models`
        );

    }


    catch (error) {

        console.error(
            '❌ Failed to load OpenRouter models:',
            error
        );


        ai1Select.innerHTML = `

            <option value="">
                Failed to load models
            </option>

        `;


        ai2Select.innerHTML = `

            <option value="">
                Failed to load models
            </option>

        `;


        ai1Select.disabled =
            true;


        ai2Select.disabled =
            true;


        if (startButton) {

            startButton.disabled =
                true;

        }


        if (loadingStatus) {

            loadingStatus.innerHTML = `

                <i class="fa-solid fa-triangle-exclamation text-red-400 mr-1"></i>

                Failed to load OpenRouter models

            `;

        }


        console.error(
            'Model loading error:',
            error.message
        );

    }

}


/*
|--------------------------------------------------------------------------
| START DEBATE
|--------------------------------------------------------------------------
*/

async function startDebateSession() {

    const topicElement =
        document.getElementById(
            'topicInput'
        );


    const topic =
        topicElement
            ? topicElement.value.trim()
            : '';


    /*
    |--------------------------------------------------------------------------
    | VALIDATE TOPIC
    |--------------------------------------------------------------------------
    */

    if (!topic) {

        alert(
            'Please enter a debate topic.'
        );

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | GET SETTINGS
    |--------------------------------------------------------------------------
    */

    const style =
        document.getElementById(
            'styleSelect'
        ).value;


    const totalRounds =
        parseInt(
            document.getElementById(
                'roundsSelect'
            ).value,
            10
        );


    const ai1Model =
        document.getElementById(
            'ai1Select'
        ).value;


    const ai2Model =
        document.getElementById(
            'ai2Select'
        ).value;


    /*
    |--------------------------------------------------------------------------
    | VALIDATE MODELS
    |--------------------------------------------------------------------------
    */

    if (
        !ai1Model ||
        !ai2Model
    ) {

        alert(
            'Please select two AI models.'
        );

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | PREVENT SAME MODEL
    |--------------------------------------------------------------------------
    */

    if (
        ai1Model === ai2Model
    ) {

        alert(
            'Please select two different AI models.'
        );

        return;

    }


    /*
    |--------------------------------------------------------------------------
    | GET UI ELEMENTS
    |--------------------------------------------------------------------------
    */

    const setupPanel =
        document.getElementById(
            'setupPanel'
        );


    const arenaContainer =
        document.getElementById(
            'arenaContainer'
        );


    const startButton =
        document.getElementById(
            'startDebateButton'
        );


    /*
    |--------------------------------------------------------------------------
    | RESET CHAT
    |--------------------------------------------------------------------------
    */

    const ai1ChatLog =
        document.getElementById(
            'ai1ChatLog'
        );


    const ai2ChatLog =
        document.getElementById(
            'ai2ChatLog'
        );


    if (ai1ChatLog) {

        ai1ChatLog.innerHTML = '';

    }


    if (ai2ChatLog) {

        ai2ChatLog.innerHTML = '';

    }


    /*
    |--------------------------------------------------------------------------
    | SHOW ARENA
    |--------------------------------------------------------------------------
    */

    if (setupPanel) {

        setupPanel.classList.add(
            'hidden'
        );

    }


    if (arenaContainer) {

        arenaContainer.classList.remove(
            'hidden'
        );

    }


    /*
    |--------------------------------------------------------------------------
    | FIND MODEL INFORMATION
    |--------------------------------------------------------------------------
    */

    const ai1Info =
        OPENROUTER_MODELS.find(
            model =>
                model.id === ai1Model
        );


    const ai2Info =
        OPENROUTER_MODELS.find(
            model =>
                model.id === ai2Model
        );


    /*
    |--------------------------------------------------------------------------
    | UPDATE MODEL NAMES
    |--------------------------------------------------------------------------
    */

    const ai1Title =
        document.getElementById(
            'ai1Title'
        );


    const ai2Title =
        document.getElementById(
            'ai2Title'
        );


    if (ai1Title) {

        ai1Title.innerText =
            ai1Info?.name ||
            ai1Model;

    }


    if (ai2Title) {

        ai2Title.innerText =
            ai2Info?.name ||
            ai2Model;

    }


    /*
    |--------------------------------------------------------------------------
    | PROVIDER
    |--------------------------------------------------------------------------
    */

    const ai1Provider =
        document.getElementById(
            'ai1Provider'
        );


    const ai2Provider =
        document.getElementById(
            'ai2Provider'
        );


    if (ai1Provider) {

        ai1Provider.innerText =
            'OpenRouter • FREE';

    }


    if (ai2Provider) {

        ai2Provider.innerText =
            'OpenRouter • FREE';

    }


    /*
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    */

    document.getElementById(
        'ai1Status'
    ).innerText =
        'Starting...';


    document.getElementById(
        'ai2Status'
    ).innerText =
        'Waiting...';


    /*
    |--------------------------------------------------------------------------
    | DISABLE START BUTTON
    |--------------------------------------------------------------------------
    */

    if (startButton) {

        startButton.disabled =
            true;

    }


    try {

        /*
        |--------------------------------------------------------------------------
        | CREATE DEBATE
        |--------------------------------------------------------------------------
        */

        console.log(
            '🚀 Creating debate...'
        );


        console.log(
            'AI 1:',
            ai1Model
        );


        console.log(
            'AI 2:',
            ai2Model
        );


        const initRes =
            await fetch(
                `${API_BASE}/debate/start`,
                {

                    method:
                        'POST',

                    headers: {

                        'Content-Type':
                            'application/json'

                    },

                    body:
                        JSON.stringify({

                            topic,

                            style,

                            ai1Model,

                            ai2Model,

                            totalRounds

                        })

                }
            );


        const initData =
            await initRes.json();


        /*
        |--------------------------------------------------------------------------
        | CHECK RESPONSE
        |--------------------------------------------------------------------------
        */

        if (!initRes.ok) {

            throw new Error(

                initData.error ||
                initData.message ||
                'Failed to start debate.'

            );

        }


        /*
        |--------------------------------------------------------------------------
        | GET DEBATE ID
        |--------------------------------------------------------------------------
        */

        const debateId =
            initData.debateId;


        if (!debateId) {

            throw new Error(
                'Backend did not return a debate ID.'
            );

        }


        console.log(
            '✅ Debate created:',
            debateId
        );


        /*
        |--------------------------------------------------------------------------
        | RUN ROUNDS
        |--------------------------------------------------------------------------
        */

        for (
            let round = 1;
            round <= totalRounds;
            round++
        ) {


            /*
            |--------------------------------------------------------------------------
            | AI 1
            |--------------------------------------------------------------------------
            */

            document.getElementById(
                'ai1Status'
            ).innerText =
                `Round ${round} Speaking...`;


            document.getElementById(
                'ai2Status'
            ).innerText =
                `Round ${round} Waiting...`;


            /*
            |--------------------------------------------------------------------------
            | CALL BACKEND
            |--------------------------------------------------------------------------
            */

            const roundRes =
                await fetch(
                    `${API_BASE}/debate/${debateId}/round`,
                    {

                        method:
                            'POST',

                        headers: {

                            'Content-Type':
                                'application/json'

                        },

                        body:
                            JSON.stringify({

                                roundNumber:
                                    round

                            })

                    }
                );


            const roundData =
                await roundRes.json();


            /*
            |--------------------------------------------------------------------------
            | CHECK ROUND
            |--------------------------------------------------------------------------
            */

            if (!roundRes.ok) {

                throw new Error(

                    roundData.error ||
                    roundData.message ||
                    `Round ${round} failed.`

                );

            }


            /*
            |--------------------------------------------------------------------------
            | DISPLAY AI 1
            |--------------------------------------------------------------------------
            */

            appendStreamMessage(

                'ai1ChatLog',

                `Round ${round}`,

                roundData.ai1Response

            );


            document.getElementById(
                'ai1Status'
            ).innerText =

                `Complete (${roundData.ai1Metrics?.timeMs || 0}ms)`;


            /*
            |--------------------------------------------------------------------------
            | AI 2
            |--------------------------------------------------------------------------
            */

            document.getElementById(
                'ai2Status'
            ).innerText =
                `Round ${round} Speaking...`;


            /*
            |--------------------------------------------------------------------------
            | DISPLAY AI 2
            |--------------------------------------------------------------------------
            */

            appendStreamMessage(

                'ai2ChatLog',

                `Round ${round}`,

                roundData.ai2Response

            );


            document.getElementById(
                'ai2Status'
            ).innerText =

                `Complete (${roundData.ai2Metrics?.timeMs || 0}ms)`;

        }


        /*
        |--------------------------------------------------------------------------
        | DEBATE COMPLETE
        |--------------------------------------------------------------------------
        */

        document.getElementById(
            'ai1Status'
        ).innerText =
            'Debate Finished';


        document.getElementById(
            'ai2Status'
        ).innerText =
            'Debate Finished';


        console.log(
            '🏆 Debate finished'
        );

    }


    catch (error) {

        console.error(
            '❌ Debate error:',
            error
        );


        alert(
            `Debate failed:\n\n${error.message}`
        );


        /*
        |--------------------------------------------------------------------------
        | RESTORE SETUP
        |--------------------------------------------------------------------------
        */

        if (setupPanel) {

            setupPanel.classList.remove(
                'hidden'
            );

        }


        if (arenaContainer) {

            arenaContainer.classList.add(
                'hidden'
            );

        }

    }


    finally {

        if (startButton) {

            startButton.disabled =
                false;

        }

    }

}


/*
|--------------------------------------------------------------------------
| ADD MESSAGE TO CHAT
|--------------------------------------------------------------------------
*/

function appendStreamMessage(
    containerId,
    title,
    text
) {

    const container =
        document.getElementById(
            containerId
        );


    if (!container) {

        return;

    }


    const div =
        document.createElement(
            'div'
        );


    div.className =
        'p-4 rounded-xl bg-slate-900/80 border border-slate-800';


    /*
    |--------------------------------------------------------------------------
    | TITLE
    |--------------------------------------------------------------------------
    */

    const titleElement =
        document.createElement(
            'span'
        );


    titleElement.className =
        'text-cyan-400 font-bold block mb-2';


    titleElement.innerText =
        title;


    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    const paragraph =
        document.createElement(
            'p'
        );


    paragraph.className =
        'text-slate-300 whitespace-pre-wrap leading-relaxed';


    paragraph.innerText =
        text ||
        'No response received.';


    /*
    |--------------------------------------------------------------------------
    | ADD TO DOM
    |--------------------------------------------------------------------------
    */

    div.appendChild(
        titleElement
    );


    div.appendChild(
        paragraph
    );


    container.appendChild(
        div
    );


    /*
    |--------------------------------------------------------------------------
    | AUTO SCROLL
    |--------------------------------------------------------------------------
    */

    container.scrollTo({

        top:
            container.scrollHeight,

        behavior:
            'smooth'

    });

}


/*
|--------------------------------------------------------------------------
| INITIALIZE DEBATE ROOM
|--------------------------------------------------------------------------
*/

async function initializeDebateRoom() {

    console.log(
        '🎯 Initializing Debate Room...'
    );


    await loadOpenRouterModels();

}


/*
|--------------------------------------------------------------------------
| EXPORT / GLOBAL ACCESS
|--------------------------------------------------------------------------
|
| These functions are intentionally attached to
| window because your HTML uses onclick=
| "startDebateSession()".
|
|--------------------------------------------------------------------------
*/

window.renderDebateRoom =
    renderDebateRoom;


window.startDebateSession =
    startDebateSession;


window.initializeDebateRoom =
    initializeDebateRoom;


window.loadOpenRouterModels =
    loadOpenRouterModels;