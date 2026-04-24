const ERROR_HTML = `

    <div class="error">
        <i class="ph-bold ph-prohibit icon"></i>
        <div class="title">Something went wrong</div>
        <p class="message">
            We couldn't connect to the server(API error). Please try again in a few moments.
        </p>
        <div class="btn-retry ,dropdown-trigger">
            <i class="ph-bold ph-arrows-clockwise"></i>
            <span>Retry</span>
        </div>
    </div>
  </main>

`;

class Errors {
  static weatherRequestFailed() {
    const main = document.querySelector("main");
    console.log(main.children);
    
    [...main.children].forEach((child) => {
      child.classList.add("hidden");
    });
    main.querySelector(".search").style.display = "none";
    main.insertAdjacentHTML("beforeend", ERROR_HTML);
    main.querySelector(".btn-retry").addEventListener("click", () => {
        main.querySelector(".error").remove();
        [...main.children].forEach((child) => {
            child.classList.remove("hidden");
            main.querySelector(".search").style.display = "flex";
      });
    });
  }
}
export { Errors };
