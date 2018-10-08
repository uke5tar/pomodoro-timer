const ready = function ( fn ) {
    if ( typeof fn !== 'function' ) return;
    if ( document.readyState === 'interactive'  || document.readyState === 'complete') {
        return fn();
    }
    document.addEventListener( 'DOMContentLoaded', fn, false );
};

ready(function() {
    
    // helper functions
    let $QSA = (elem) => document.querySelectorAll(elem),
        $QS = (elem) => document.querySelector(elem),
        $ID = (elem) => document.getElementById(elem),
        $breakCounter = $ID("break-counter"),
        $breakDisplay = $ID("break-display"),
        $sessionCounter = $ID("session-counter"),
        $sessionDisplay = $ID("session-display"),
        $roundsCounter = $ID("rounds-counter"),
        $roundsDisplay = $ID("rounds-display"),
        $roundsName = $ID("rounds-name"),
        $clock = $QS(".pomodoro-clock"),
        $start = $ID("start"),
        $stopResume = $ID("stopresume"),
        $reset = $ID("reset"),
        breakInit = 5,
        sessionInit = 10,
        roundsInit = 3,
        sessionStart = sessionInit,
        breakStart = breakInit,
        roundsStart = roundsInit,
        sessionValue = sessionInit,
        breakValue = breakInit,
        roundsValue = roundsInit,
        roundsLeft = roundsInit,
        needZero = (time => time < 10 ? "0" + time : time),
        zeros = ":00",
        sessionInterval,
        breakInterval,
        seconds = 60,
        pauseTriggered,
        sessionIsRunning,
        breakIsRunning,
        showEndscreen = function() {
            $clock.classList.remove("play-animation");
            $clock.classList.add("pause-animation");
            $sessionDisplay.classList.add("pomodoro-end");
            $sessionDisplay.innerText = "Time is up";
            $sessionDisplay.classList.add("gr3");
            Array.from($QSA(".pomodoro-title, #break-display")).map(a => a.style.display = "none");
        },
        removeEndScreen = function() {
            $sessionDisplay.classList.remove("pomodoro-end");
            $breakCounter.innerText = breakValue;
            $sessionDisplay.classList.remove("gr3");
            Array.from($QSA(".pomodoro-title, #break-display")).map(a => a.style.display = "block");
        };
    
    // init function
    (function init() {
        initTimes();
        attachCounterEvents();
        oneTime();
    })();
    
    // onetime function to change "Rounds" to "Rounds Left:" after start
    function oneTime() {
        $start.addEventListener("click", function() {
            roundsLeft = roundsValue - 1;
            $roundsName.innerText = "Rounds left: ";
            $roundsDisplay.innerText = roundsLeft;
            this.removeEventListener("click", oneTime);
        });
    }
    
    // initialize all the defined timings
    function initTimes() {
        $breakCounter.innerText = breakValue;
        $sessionCounter.innerText = sessionValue;
        $roundsCounter.innerText = roundsStart;
        $breakDisplay.innerText = needZero(breakValue) + zeros;
        $sessionDisplay.innerText = needZero(sessionValue) + zeros;
        $roundsDisplay.innerText = roundsLeft;
        $stopResume.classList.add("btn-disabled");
    }

    // set break length
    function setBreakCounter() {
        // decide whether to add or substract counter
        if(breakValue > 1) {
            if(this.className === "add") {
                $breakCounter.innerText = ++breakValue;
                $breakDisplay.innerText = needZero(breakValue) + zeros;
            } else {
                $breakCounter.innerText = --breakValue;
                $breakDisplay.innerText = needZero(breakValue) + zeros;
            }    
        } else {
            if(this.className === "add") {
                $breakCounter.innerText = ++breakValue;
                $breakDisplay.innerText = needZero(breakValue) + zeros;
            }
        }
        breakStart = breakValue; // assign start value of breakValue in case of multiple rounds
    }
    
    // set session length
    function setSessionCounter() {
        if(sessionValue > 1) {
            if(this.className === "add") {
                $sessionCounter.innerText = ++sessionValue;
                $sessionDisplay.innerText = needZero(sessionValue) + zeros;
            } else {
                $sessionCounter.innerText = --sessionValue;
                $sessionDisplay.innerText = needZero(sessionValue) + zeros;
            }
        } else {
            if(this.className === "add") {
                $sessionCounter.innerText = ++sessionValue;
                $sessionDisplay.innerText = needZero(sessionValue) + zeros;
            }
        }
        sessionStart = sessionValue;
    };
    
        // set break length
    function setRoundsCounter() {
        // decide whether to add or substract counter
        if(roundsValue > 1) {
            if(this.className === "add") {
                $roundsCounter.innerText = ++roundsValue;
                $roundsDisplay.innerText = roundsValue;
            } else {
                $roundsCounter.innerText = --roundsValue;
                $roundsDisplay.innerText = roundsValue;
            }    
        } else {
            if(this.className === "add") {
                $roundsCounter.innerText = ++roundsValue;
                $roundsDisplay.innerText = roundsValue;
            }
        }
        roundsStart = roundsValue;
    }

    // session countdown
    function sessionTimer() {
        sessionIsRunning = true;
        breakIsRunning = false;
        removeCounterEvents(); // remove event handlers
        $stopResume.addEventListener("click", stopResume);
        $stopResume.classList.remove("btn-disabled");
        $clock.classList.add("session-animation");
        $clock.classList.add("play-animation");
        
        if(!pauseTriggered) {
            --sessionValue;
        }
        pauseTriggered = false;
        
        // interval that displays the countdown
        sessionInterval = setInterval(function() {
            if(sessionValue >= 0 && seconds > 0) {
                $sessionDisplay.innerText = needZero(sessionValue) + ":" + needZero(--seconds);
                if(seconds === 0) {
                    (needZero(sessionValue--), seconds = 60);
                }
            }
            else {
                clearInterval(sessionInterval);
                $stopResume.classList.add("btn-disabled");
                $reset.classList.remove("btn-disabled");
                $stopResume.removeEventListener("click", stopResume);
                $start.removeEventListener("click", sessionTimer);
                $reset.addEventListener("click", resetTimer);
                breakTimer();
            }
        }, 1000);
    }
    
    // break countdown
    function breakTimer() {
        sessionIsRunning = false;
        breakIsRunning = true;
        removeCounterEvents();
        $stopResume.addEventListener("click", stopResume);
        $stopResume.classList.remove("btn-disabled");
        $clock.classList.remove("session-animation");
        $clock.classList.add("break-animation");
        if(!pauseTriggered) {
            --breakValue;
            $ID("sound").play();
        }
        
        // interval that displays the countdown
        breakInterval = setInterval(function() {
            if(breakValue >= 0 && seconds > 0) {
                $breakDisplay.innerText = needZero(breakValue) + ":" + needZero(--seconds);
                if(seconds === 0) {
                    (needZero(breakValue--), seconds = 60);
                }
            }
            else {
                if(roundsValue > 1) {
                    clearInterval(breakInterval);
                    roundsTimer();
                } else {
                    clearInterval(breakInterval);
                    $stopResume.classList.add("btn-disabled");
                    $reset.classList.remove("btn-disabled");
                    $stopResume.removeEventListener("click", stopResume);
                    $start.removeEventListener("click", breakTimer);
                    $reset.addEventListener("click", resetTimer);
                    $ID("sound").play();
                    showEndscreen();    
                }
            }
        }, 1000);
        pauseTriggered = false;
    }
    
    // calculates rounds
    function roundsTimer() {
        --roundsValue;
        --roundsLeft;
        breakValue = breakStart;
        sessionValue = sessionStart;
        seconds = 60;
        initTimes();
        sessionTimer();
        $ID("sound").play();
    }
    
    // toggle stop/ resume name
    function stopResume() {
        pauseTriggered = true;
        if(sessionIsRunning) {
            clearInterval(sessionInterval);
        }
        if(breakIsRunning) {
            clearInterval(breakInterval);
        }
        
        let a = $stopResume.innerText;
        a === "Stop" ? a = "Resume" : a = "Stop"; // toggle name
        $stopResume.innerText = a;
        $reset.classList.remove("btn-disabled");
        $reset.addEventListener("click", resetTimer);
        if(sessionIsRunning) {
            $stopResume.addEventListener("click", sessionTimer);
        } 
        if(breakIsRunning) {
            $stopResume.removeEventListener("click", sessionTimer);
            $stopResume.addEventListener("click", breakTimer);
        }
        
        $clock.classList.remove("play-animation");
        $clock.classList.add("pause-animation");
    }
    
    // reset all countdown timers
    function resetTimer() {
        // reset value
        sessionValue = sessionStart = sessionInit;
        breakValue = breakStart = breakInit;
        roundsValue = roundsStart = roundsInit;
        roundsLeft = roundsInit;
        seconds = 60;
        pauseTriggered = false;
        initTimes(); // reset display
        attachCounterEvents(); // reattach event handlers
        $stopResume.innerText = "Stop";
        
        $stopResume.removeEventListener("click", sessionTimer);
        $stopResume.removeEventListener("click", breakTimer);
        $stopResume.removeEventListener("click", stopResume);
        $stopResume.classList.add("btn-disabled");
        
        $clock.classList.remove("session-animation");
        $clock.classList.remove("break-animation");
        
        // show all buttons active
        Array.from($QSA("#break button, #session button, #rounds button, #start")).map(a => a.classList.remove("btn-disabled"));
        
        $roundsName.innerText = "Rounds: ";
        oneTime();
        // remove end screen
        removeEndScreen();
    }
    
        // call function on break and session both each on + and - button
    function attachCounterEvents() {
        // events for + and - buttons
        Array.from($QSA("#break button")).map(a => a.addEventListener("click", setBreakCounter));
        Array.from($QSA("#session button")).map(a => a.addEventListener("click", setSessionCounter));
        Array.from($QSA("#rounds button")).map(a => a.addEventListener("click", setRoundsCounter));
        
        $start.addEventListener("click", sessionTimer);
        $reset.addEventListener("click", resetTimer);
    }
    
    // remove all event listeners on click
    function removeCounterEvents() {
        Array.from($QSA("#break button")).map(a => a.removeEventListener("click", setBreakCounter));
        Array.from($QSA("#session button")).map(a => a.removeEventListener("click", setSessionCounter));
        Array.from($QSA("#rounds button")).map(a => a.removeEventListener("click", setRoundsCounter));
        // show disability of buttons
        Array.from($QSA("#break button, #session button, #rounds button, #start, #reset")).map(a => a.classList.add("btn-disabled"));
        $start.removeEventListener("click", sessionTimer);
        $start.removeEventListener("click", breakTimer);
        $reset.removeEventListener("click", resetTimer);
        $stopResume.removeEventListener("click", sessionTimer);
        $stopResume.removeEventListener("click", breakTimer);
    };

// end document ready
});