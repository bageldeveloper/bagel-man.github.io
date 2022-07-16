// Get the new year 
const getNewYear = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const currentDay = new Date().getDay();
    if(currentDay < 20 && currentMonth <= 4){
        return new Date(`April 20 ${currentYear} 00:00:00`);
    }
    return new Date(`April 20 ${currentYear + 1} 00:00:00`);
};

// update the year element


// select elements
const app = document.querySelector('.countdown-timer');
const message = document.querySelector('.message');
const heading = document.querySelector('h1');



const render = (time) => {
    newPageTitle = time.days + " days " + time.hours  + " hrs "  + time.minutes  + " mins " + time.seconds + " secs";
    document.title = newPageTitle;
    app.innerHTML = `
        <div class="count-down">
            <div class="timer">
                <h2 class="days">${time.days}</h2>
                <small>Days</small>
            </div>
            <div class="timer">
                <h2 class="hours">${time.hours}</h2>
                <small>Hours</small>
            </div>
            <div class="timer">
                <h2 class="minutes">${time.minutes}</h2>
                <small>Minutes</small>
            </div>
            <div class="timer">
                <h2 class="seconds">${time.seconds}</h2>
                <small>Seconds</small>
            </div>
        </div>
        `;
};


const showMessage = () => {
    message.innerHTML = `teehee funny number day!`;
    app.innerHTML = '';
    heading.style.display = 'none';
};

const hideMessage = () => {
    message.innerHTML = '';
    heading.style.display = 'block';
};

const complete = () => {
    showMessage();

    // restart the countdown after showing the 
    // greeting message for a day ()
    setTimeout(() => {
        hideMessage();
        countdownTimer.setExpiredDate(getNewYear());
    }, 1000 * 60 * 60 * 24);
};

const countdownTimer = new CountDown(
    getNewYear(),
    render,
    complete
);