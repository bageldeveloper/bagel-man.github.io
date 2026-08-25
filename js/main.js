const gameGrid = document.getElementById("gameGrid");
const genreRowsContainer = document.getElementById("genreRows");
const searchInput = document.getElementById("searchInput");
const pageTitle = document.getElementById("pageTitle");
const randomBtn = document.getElementById("randomGame");

let activeGenre = "all";


/* ============================================================
   CARD ROTATION
   ============================================================ */

function randomCardRotation() {
    const rotation =
        Math.random() * 6 - 3;

    return rotation.toFixed(2);
}


/* ============================================================
   ANIMATION
   ============================================================ */

function animateCards() {

    const cards =
        document.querySelectorAll(".card");

    cards.forEach((card, i) => {

        card.classList.remove("enter");

        card.style.animationDelay =
            `${i * 15}ms`;

        /*
         * Force a style recalculation so removing and
         * re-adding the animation class actually works.
         */
        void card.offsetWidth;

        card.classList.add("enter");
    });
}


/* ============================================================
   GENRE CONFIG
   ============================================================ */

const GENRES = {

    all: null,

    allGames: null,

    favorite: [
        "favorite"
    ],

    adventure: [
        "adventure"
    ],

    puzzle: [
        "puzzle"
    ],

    simulation: [
        "simulation"
    ],

    shooter: [
        "shooter"
    ],

    towerDefense: [
        "tower-defense"
    ],

    racing: [
        "racing"
    ],

    sports: [
        "sports"
    ],

    action: [
        "action"
    ],

    platformer: [
        "platformer"
    ],

    strategy: [
        "strategy"
    ],

    original: [
        "original"
    ]
};


/* ============================================================
   HELPERS
   ============================================================ */

function normalize(tag) {

    return String(tag || "")
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-");
}


function getGamesByGenre(tags) {

    return Object.values(gamersgaming)
        .filter(game => {

            if (!tags) {
                return true;
            }

            return game.tags.some(t =>
                tags.includes(
                    normalize(t)
                )
            );
        });
}


/* ============================================================
   CARD CREATION
   ============================================================ */

function createCard(game) {

    const a =
        document.createElement("a");

    a.href =
        game.url;

    a.className =
        "card";

    const rotation =
        randomCardRotation();

    a.style.setProperty(
        "--rotation",
        `${rotation}deg`
    );

    const img =
        game.image ||
        "skele.gif";

    a.innerHTML = `
        <div
            class="card-bg"
            style="background-image:url('${img}')"
        ></div>

        <div class="card-overlay">
            <h4 class="game-title">
                ${game.name}
            </h4>
        </div>
    `;

    return a;
}


/* ============================================================
   RENDER GENRE
   ============================================================ */

function renderGenre(genreKey) {

    activeGenre =
        genreKey;

    const tags =
        GENRES[genreKey];

    gameGrid.innerHTML =
        "";

    genreRowsContainer.innerHTML =
        "";

    const games =
        getGamesByGenre(tags);

    games.forEach(game => {

        gameGrid.appendChild(
            createCard(game)
        );

    });

    gameGrid.style.display =
        "grid";

    genreRowsContainer.style.display =
        "none";

    const selectedButton =
        document.querySelector(
            `[data-genre="${genreKey}"]`
        );

    pageTitle.textContent =
        genreKey === "all"
            ? "Home"
            : selectedButton
                ? selectedButton.textContent.trim()
                : genreKey;

    animateCards();
}


/* ============================================================
   SIDEBAR EVENTS
   ============================================================ */

document
    .querySelectorAll(
        ".game-categories button"
    )
    .forEach(btn => {

        btn.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".game-categories button"
                    )
                    .forEach(b =>
                        b.classList.remove(
                            "active"
                        )
                    );

                btn.classList.add(
                    "active"
                );

                const genre =
                    btn.dataset.genre;

                if (genre === "all") {

                    renderAll();

                } else {

                    renderGenre(
                        genre
                    );
                }

            }
        );

    });


/* ============================================================
   ALL
   ============================================================ */

function renderAll() {

    activeGenre =
        "all";

    gameGrid.innerHTML =
        "";

    genreRowsContainer.innerHTML =
        "";

    Object.entries(
        GENRES
    ).forEach(
        ([key, tags]) => {

            if (!tags) {
                return;
            }

            const games =
                getGamesByGenre(tags);

            if (!games.length) {
                return;
            }

            const row =
                createCarouselRow(
                    key.charAt(0)
                        .toUpperCase() +
                    key.slice(1),

                    games
                );

            genreRowsContainer.appendChild(
                row
            );

        }
    );

    gameGrid.style.display =
        "none";

    genreRowsContainer.style.display =
        "block";

    pageTitle.textContent =
        "Home";
}


/* ============================================================
   SEARCH
   ============================================================ */

const searchIcon =
    document.getElementById(
        "searchIcon"
    );

function setIcon(state) {

    if (state === "clear") {

        searchIcon.innerHTML =
            `<span style="
                font-size: 18px;
                font-weight: 900;
            ">✖</span>`;

        return;
    }

    searchIcon.innerHTML =
        `
        <img
            src="images/icons/search.png"
            alt="Search"
        >
        `;
}


const suggestionsBox =
    document.getElementById(
        "searchSuggestions"
    );

let searchFocused =
    false;


function getRecommendedGames() {

    return Object.values(
        gamersgaming
    )
        .filter(g =>
            g.tags.includes("favorite") ||
            g.tags.includes("popular")
        )
        .slice(
            0,
            5
        );
}


function getRandomGame() {

    const games =
        Object.values(
            gamersgaming
        );

    return games[
        Math.floor(
            Math.random() *
            games.length
        )
    ];
}


function renderDefaultSuggestions() {

    const recommended =
        getRecommendedGames();

    suggestionsBox.innerHTML =
        "";

    const label1 =
        document.createElement(
            "div"
        );

    label1.className =
        "search-section-label";

    label1.textContent =
        "Recommended";

    suggestionsBox.appendChild(
        label1
    );


    recommended.forEach(
        game => {

            const item =
                document.createElement(
                    "div"
                );

            item.textContent =
                game.name;

            item.onclick =
                () => {

                    window.location.href =
                        game.url;
                };

            suggestionsBox.appendChild(
                item
            );
        }
    );


    const divider =
        document.createElement(
            "div"
        );

    divider.className =
        "search-section-label";

    divider.textContent =
        " ";

    suggestionsBox.appendChild(
        divider
    );


    const random =
        getRandomGame();


    if (random) {

        const randomItem =
            document.createElement(
                "div"
            );

        randomItem.textContent =
            "Random Game!";

        randomItem.onclick =
            () => {

                window.location.href =
                    random.url;

            };

        suggestionsBox.appendChild(
            randomItem
        );
    }


    suggestionsBox.style.display =
        "flex";
}


function renderSearchSuggestions(query) {

    const matches =
        Object.values(
            gamersgaming
        )
            .filter(
                g =>
                    g.name
                        .toLowerCase()
                        .includes(query)
            )
            .slice(
                0,
                6
            );

    suggestionsBox.innerHTML =
        "";

    if (!matches.length) {

        suggestionsBox.style.display =
            "none";

        return;
    }


    matches.forEach(
        game => {

            const item =
                document.createElement(
                    "div"
                );

            item.textContent =
                game.name;

            item.onclick =
                () => {

                    window.location.href =
                        game.url;

                };

            suggestionsBox.appendChild(
                item
            );
        }
    );


    suggestionsBox.style.display =
        "flex";
}


searchInput.addEventListener(
    "focus",
    () => {

        searchFocused =
            true;

        renderDefaultSuggestions();
    }
);


function runSearch(q) {

    if (!q) {

        setIcon("search");

        renderDefaultSuggestions();

        return;
    }


    setIcon("clear");

    renderSearchSuggestions(
        q
    );


    gameGrid.innerHTML =
        "";

    genreRowsContainer.style.display =
        "none";

    gameGrid.style.display =
        "grid";


    Object.values(
        gamersgaming
    )
        .filter(
            g =>
                g.name
                    .toLowerCase()
                    .includes(q)
        )
        .forEach(
            game => {

                gameGrid.appendChild(
                    createCard(game)
                );

            }
        );


    pageTitle.textContent =
        `Search: "${q}"`;

    animateCards();
}


searchInput.addEventListener(
    "input",
    e => {

        runSearch(
            e.target.value
                .toLowerCase()
                .trim()
        );

    }
);


searchInput.addEventListener(
    "blur",
    () => {

        searchFocused =
            false;

        setTimeout(
            () => {

                suggestionsBox.style.display =
                    "none";

            },
            150
        );

    }
);


searchIcon.addEventListener(
    "click",
    () => {

        const hasText =
            searchInput.value.trim().length >
            0;


        if (hasText) {

            searchInput.value =
                "";

            setIcon(
                "search"
            );

            suggestionsBox.style.display =
                "none";


            if (activeGenre === "all") {

                renderAll();

            } else {

                renderGenre(
                    activeGenre
                );
            }


            pageTitle.textContent =
                activeGenre === "all"
                    ? "Home"
                    : activeGenre;

            return;
        }


        searchInput.focus();
    }
);


/* ============================================================
   CAROUSEL
   ============================================================ */

function createCarouselRow(
    titleText,
    games
) {

    const section =
        document.createElement(
            "div"
        );

    section.className =
        "genre-row";


    const title =
        document.createElement(
            "h2"
        );

    title.textContent =
        titleText;


    const wrapper =
        document.createElement(
            "div"
        );

    wrapper.className =
        "row-wrapper";


    const prev =
        document.createElement(
            "button"
        );

    prev.className =
        "row-arrow prev";

    prev.textContent =
        "◀";

    prev.setAttribute(
        "aria-label",
        "Previous games"
    );


    const next =
        document.createElement(
            "button"
        );

    next.className =
        "row-arrow next";

    next.textContent =
        "▶";

    next.setAttribute(
        "aria-label",
        "Next games"
    );


    const row =
        document.createElement(
            "div"
        );

    row.className =
        "row-games";


    const cardWidth =
        236;

    const sidebarWidth =
        200;


    function calcVisible() {

        const w =
            wrapper.offsetWidth ||
            (
                window.innerWidth -
                sidebarWidth -
                32
            );

        return Math.max(
            1,
            Math.floor(
                w / cardWidth
            )
        );
    }


    let visible =
        calcVisible();

    let index =
        0;

    const rendered =
        new Set();


    function animateNewCard(
        card,
        delay = 0
    ) {

        card.classList.remove(
            "enter"
        );

        card.style.animationDelay =
            `${delay}ms`;

        requestAnimationFrame(
            () => {

                requestAnimationFrame(
                    () => {

                        card.classList.add(
                            "enter"
                        );

                    }
                );

            }
        );
    }


    function renderRange() {

        const end =
            Math.min(
                index +
                visible +
                4,

                games.length
            );


        for (
            let i = index;
            i < end;
            i++
        ) {

            if (
                rendered.has(i)
            ) {
                continue;
            }


            const card =
                createCard(
                    games[i]
                );


            row.appendChild(
                card
            );


            animateNewCard(
                card,
                (i - index) * 25
            );


            rendered.add(
                i
            );
        }
    }


    function update() {

        visible =
            calcVisible();

        row.style.transform =
            `translateX(${
                -index *
                cardWidth
            }px)`;


        prev.style.visibility =
            index > 0
                ? "visible"
                : "hidden";


        next.style.visibility =
            index <
            games.length -
            visible
                ? "visible"
                : "hidden";


        renderRange();
    }


    prev.onclick =
        () => {

            if (
                index <= 0
            ) {
                return;
            }

            index--;

            update();
        };


    next.onclick =
        () => {

            if (
                index >=
                games.length -
                visible
            ) {
                return;
            }

            index++;

            update();
        };


    update();


    const ro =
        new ResizeObserver(
            () => {

                update();

            }
        );

    ro.observe(
        wrapper
    );


    wrapper.appendChild(
        prev
    );

    wrapper.appendChild(
        row
    );

    wrapper.appendChild(
        next
    );


    section.appendChild(
        title
    );

    section.appendChild(
        wrapper
    );


    return section;
}


/* ============================================================
   SETTINGS
   ============================================================ */

function toggleSettings() {

    document
        .getElementById(
            "settings-panel"
        )
        .classList.toggle(
            "open"
        );


    document
        .getElementById(
            "announce-panel"
        )
        .classList.remove(
            "visible"
        );


    document
        .getElementById(
            "chat-panel"
        )
        .classList.remove(
            "open"
        );
}


document.addEventListener(
    "click",
    e => {

        const panel =
            document.getElementById(
                "settings-panel"
            );

        const btn =
            document.querySelector(
                '[onclick="toggleSettings()"]'
            );


        if (
            panel.classList.contains("open") &&
            !panel.contains(e.target) &&
            !btn.contains(e.target)
        ) {

            panel.classList.remove(
                "open"
            );
        }
    }
);


function applyLightMode(on) {

    document.body.classList.toggle(
        "light",
        on
    );

    localStorage.setItem(
        "lightMode",
        on ? "1" : "0"
    );
}


function applyAdBlock(on) {

    localStorage.setItem(
        "adBlock",
        on ? "1" : "0"
    );


    if (on) {

        document
            .querySelectorAll(
                'script[src*="googlesyndication"], script[src*="adsbygoogle"]'
            )
            .forEach(
                s => s.remove()
            );


        document
            .querySelectorAll(
                'ins.adsbygoogle, [id*="ad-"], [class*="ad-slot"]'
            )
            .forEach(
                el =>
                    el.style.display =
                        "none"
            );


        window.adsbygoogle =
            {
                loaded: true,

                push: () => {}
            };

    } else {

        location.reload();
    }
}


(function restoreSettings() {

    if (
        localStorage.getItem(
            "lightMode"
        ) === "1"
    ) {

        document.body.classList.add(
            "light"
        );

        document.getElementById(
            "toggle-light"
        ).checked = true;
    }


    if (
        localStorage.getItem(
            "adBlock"
        ) === "1"
    ) {

        document.getElementById(
            "toggle-ads"
        ).checked = true;

        applyAdBlock(
            true
        );

    } else {

        const s =
            document.createElement(
                "script"
            );

        s.async =
            true;

        s.src =
            "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4474724430572739";

        s.crossOrigin =
            "anonymous";

        document.head.appendChild(
            s
        );
    }

})();


/* ============================================================
   INIT
   ============================================================ */

(function initFromQuery() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const q =
        params.get("q");

    const genre =
        params.get("genre");


    if (q) {

        searchInput.value =
            q;

        runSearch(
            q.toLowerCase().trim()
        );

        return;
    }


    if (
        genre &&
        genre in GENRES
    ) {

        document
            .querySelectorAll(
                ".game-categories button"
            )
            .forEach(
                b =>
                    b.classList.toggle(
                        "active",
                        b.dataset.genre === genre
                    )
            );


        if (
            genre === "all"
        ) {

            renderAll();

        } else {

            renderGenre(
                genre
            );
        }

        return;
    }


    renderAll();

})();