/**
 * Swapy.js - A lightweight library for making dashboard sections draggable and swappable
 */

class Swapy {
  constructor(options = {}) {
    this.options = {
      selector: ".draggable-section",
      handleSelector: ".drag-handle",
      swapThreshold: 50,
      animationDuration: 300,
      ...options,
    };

    this.elements = [];
    this.draggedElement = null;
    this.draggedIndex = -1;
    this.startPosition = { x: 0, y: 0 };
    this.currentPosition = { x: 0, y: 0 };
    this.initialized = false;

    this.init();
  }

  init() {
    if (typeof window === "undefined") return;

    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.elements = Array.from(
      document.querySelectorAll(this.options.selector),
    );

    this.elements.forEach((element, index) => {
      // Store original position
      element.dataset.swapyIndex = index;
      element.dataset.swapyOrder = element.style.order || index;

      // Find handle or use the element itself
      const handle = this.options.handleSelector
        ? element.querySelector(this.options.handleSelector)
        : element;

      if (handle) {
        handle.style.cursor = "grab";
        handle.addEventListener("mousedown", (e) =>
          this.handleDragStart(e, element),
        );
      }
    });

    document.addEventListener("mousemove", (e) => this.handleDragMove(e));
    document.addEventListener("mouseup", () => this.handleDragEnd());

    this.initialized = true;

    // Dispatch event when initialized
    window.dispatchEvent(new CustomEvent("swapy:initialized"));
  }

  handleDragStart(e, element) {
    if (!this.initialized) return;

    // Only handle left mouse button
    if (e.button !== 0) return;

    e.preventDefault();

    this.draggedElement = element;
    this.draggedIndex = parseInt(element.dataset.swapyIndex);

    // Store starting position
    this.startPosition = {
      x: e.clientX,
      y: e.clientY,
    };

    this.currentPosition = { ...this.startPosition };

    // Add dragging class
    this.draggedElement.classList.add("swapy-dragging");
    this.draggedElement.style.zIndex = "1000";
    this.draggedElement.style.opacity = "0.8";

    // Change cursor
    document.body.style.cursor = "grabbing";

    // Dispatch event
    window.dispatchEvent(
      new CustomEvent("swapy:dragstart", {
        detail: { element: this.draggedElement, index: this.draggedIndex },
      }),
    );
  }

  handleDragMove(e) {
    if (!this.draggedElement) return;

    e.preventDefault();

    // Calculate how far we've moved
    const deltaX = e.clientX - this.startPosition.x;
    const deltaY = e.clientY - this.startPosition.y;

    // Update current position
    this.currentPosition = {
      x: e.clientX,
      y: e.clientY,
    };

    // Move the element
    this.draggedElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

    // Check for potential swaps
    this.checkForSwap();

    // Dispatch event
    window.dispatchEvent(
      new CustomEvent("swapy:dragmove", {
        detail: { element: this.draggedElement, deltaX, deltaY },
      }),
    );
  }

  checkForSwap() {
    if (!this.draggedElement) return;

    const draggedRect = this.draggedElement.getBoundingClientRect();
    const draggedCenter = {
      x: draggedRect.left + draggedRect.width / 2,
      y: draggedRect.top + draggedRect.height / 2,
    };

    let closestElement = null;
    let closestDistance = Infinity;
    let closestIndex = -1;

    this.elements.forEach((element, index) => {
      if (element === this.draggedElement) return;

      const rect = element.getBoundingClientRect();
      const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      // Calculate distance (primarily vertical for dashboard sections)
      const distance = Math.abs(center.y - draggedCenter.y);

      if (distance < closestDistance && distance < this.options.swapThreshold) {
        closestDistance = distance;
        closestElement = element;
        closestIndex = index;
      }
    });

    // If we found a close element, highlight it
    this.elements.forEach((el) => {
      if (el === closestElement) {
        el.classList.add("swapy-swap-target");
      } else if (el !== this.draggedElement) {
        el.classList.remove("swapy-swap-target");
      }
    });
  }

  handleDragEnd() {
    if (!this.draggedElement) return;

    // Find the element we're hovering over
    const draggedRect = this.draggedElement.getBoundingClientRect();
    const draggedCenter = {
      x: draggedRect.left + draggedRect.width / 2,
      y: draggedRect.top + draggedRect.height / 2,
    };

    let targetElement = null;
    let targetIndex = -1;
    let minDistance = Infinity;

    this.elements.forEach((element, index) => {
      if (element === this.draggedElement) return;

      const rect = element.getBoundingClientRect();
      const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };

      // Calculate distance (primarily vertical)
      const distance = Math.abs(center.y - draggedCenter.y);

      if (distance < minDistance && distance < this.options.swapThreshold) {
        minDistance = distance;
        targetElement = element;
        targetIndex = index;
      }
    });

    // If we found a target, swap the elements
    if (targetElement) {
      this.swapElements(this.draggedElement, targetElement);
    }

    // Reset the dragged element
    this.draggedElement.style.transform = "";
    this.draggedElement.style.zIndex = "";
    this.draggedElement.style.opacity = "";
    this.draggedElement.classList.remove("swapy-dragging");

    // Remove any swap target highlights
    this.elements.forEach((el) => {
      el.classList.remove("swapy-swap-target");
    });

    // Reset cursor
    document.body.style.cursor = "";

    // Dispatch event
    window.dispatchEvent(
      new CustomEvent("swapy:dragend", {
        detail: {
          element: this.draggedElement,
          swapped: targetElement !== null,
        },
      }),
    );

    // Reset variables
    this.draggedElement = null;
    this.draggedIndex = -1;
  }

  swapElements(element1, element2) {
    // Get the current order values
    const order1 = parseInt(element1.dataset.swapyOrder);
    const order2 = parseInt(element2.dataset.swapyOrder);

    // Swap the order values
    element1.style.order = order2;
    element2.style.order = order1;

    // Update the data attributes
    element1.dataset.swapyOrder = order2;
    element2.dataset.swapyOrder = order1;

    // Save to localStorage if available
    this.saveOrderToStorage();

    // Dispatch event
    window.dispatchEvent(
      new CustomEvent("swapy:swap", {
        detail: { element1, element2, order1, order2 },
      }),
    );
  }

  saveOrderToStorage() {
    if (typeof localStorage === "undefined") return;

    const orderData = {};

    this.elements.forEach((element) => {
      const id = element.id || element.dataset.swapyId;
      if (id) {
        orderData[id] = element.dataset.swapyOrder;
      }
    });

    localStorage.setItem("swapy-order", JSON.stringify(orderData));
  }

  loadOrderFromStorage() {
    if (typeof localStorage === "undefined") return;

    try {
      const orderData = JSON.parse(localStorage.getItem("swapy-order"));
      if (!orderData) return;

      this.elements.forEach((element) => {
        const id = element.id || element.dataset.swapyId;
        if (id && orderData[id] !== undefined) {
          element.style.order = orderData[id];
          element.dataset.swapyOrder = orderData[id];
        }
      });
    } catch (e) {
      console.error("Error loading Swapy order from localStorage", e);
    }
  }

  refresh() {
    this.elements = Array.from(
      document.querySelectorAll(this.options.selector),
    );
    this.elements.forEach((element, index) => {
      if (!element.dataset.swapyIndex) {
        element.dataset.swapyIndex = index;
        element.dataset.swapyOrder = element.style.order || index;

        const handle = this.options.handleSelector
          ? element.querySelector(this.options.handleSelector)
          : element;

        if (handle) {
          handle.style.cursor = "grab";
          handle.addEventListener("mousedown", (e) =>
            this.handleDragStart(e, element),
          );
        }
      }
    });
  }

  destroy() {
    this.elements.forEach((element) => {
      const handle = this.options.handleSelector
        ? element.querySelector(this.options.handleSelector)
        : element;

      if (handle) {
        handle.style.cursor = "";
        handle.removeEventListener("mousedown", this.handleDragStart);
      }

      element.classList.remove("swapy-dragging", "swapy-swap-target");
      element.style.transform = "";
      element.style.zIndex = "";
      element.style.opacity = "";
    });

    document.removeEventListener("mousemove", this.handleDragMove);
    document.removeEventListener("mouseup", this.handleDragEnd);

    this.initialized = false;
  }
}

// Export for module environments
if (typeof module !== "undefined" && module.exports) {
  module.exports = Swapy;
}

// Export for browser environments
if (typeof window !== "undefined") {
  window.Swapy = Swapy;
}

export default Swapy;
