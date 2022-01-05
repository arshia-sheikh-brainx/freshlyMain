$(document).ready(function () {

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let date = new Date();
    let day = date.getDay();
    const numberOfDaysToAdd = 8 - day;
    date.setDate(date.getDate() + numberOfDaysToAdd);
    localStorage.setItem("mealPlan", 4);  //default meal plan
    let itemCount = 0;
    let totalCost = 0;
    let cart = [];  //initaize cart array

    //get cart summary div  
    let cartSummarytemplate = $("template")[3];
    let cartSummarydiv = cartSummarytemplate.content.querySelector("div");
    let cartSummary = document.importNode(cartSummarydiv, true);

    //add text to cart footer
    $(".message").text(`Please add total ${localStorage.getItem("mealPlan")} items to continue`);

    //promo 
    $(".promo-btn").click(function(){
        $(this).css("display","none");
        $(".promo").removeClass("display");
    });
    
        // step function
        const steps = $('#demo').steps({});
        let stepsApi = steps.data('plugin_Steps');
    
        /* meal plan section functions*/

        $('[data-meal-plan]').click(function (e) {
            let target = e.delegateTarget;
            let selectMealPlan = $(target).attr("data-meal-plan");
            localStorage.setItem("mealPlan", selectMealPlan);
            mealPlan = selectMealPlan;
            //add text to cart footer
            $(".message").text(`Please add ${localStorage.getItem("mealPlan")} items to continue`);
            //if plan change than update cart button and cart footer
            cartButtonCkeck(); 
            updateCartFooter();
    
        });


        /* day section functions*/

            //loop to show dates
         for (let i = 0; i < 10; i++) {
        // using template list propagation
        let temp = $("template")[0];
        //get the div element from the template:
        let item = temp.content.querySelector("li");;
        if (i == 0) {
            createDateList(true, item);
        } else {
            createDateList(false, item);
        }
          }

         //show date on date page + menu page 
         showDate();

    //  function create date list
        function createDateList(isActive, item) {
        let day = date.getDay();
        let month = date.getMonth();
        let dayOfMonth = date.getDate();
        date.setDate(date.getDate() + 1);
        //Create a new node, based on the template:
        let li = document.importNode(item, true);
        $(li).attr({
            "data-day": days[day],
            "data-day-of-month": dayOfMonth,
            "data-month": months[month]
        });
        let text = ", " + months[month] + " " + dayOfMonth;
        $(li).children("strong").text(days[day]);
        let popular = "<span class='badge green-text'><i class='far fa-star'></i> Most Poular</span>";
        $(li).append(text);
     

        if (isActive) {
            $(li).append(popular);
            $(li).addClass('active-date');
            localStorage.setItem("day", days[day]);
            localStorage.setItem("dayOfMonth", dayOfMonth);
            localStorage.setItem("month", months[month]);
        }
        //add Event listener to list item
        $(li).click((e) => {
            addListStyle(e)
        });
        //append list item to the date-list div
        $(".date-list").append(li);

          //add date list on checkout page
        addCheeckoutOptions(day,month,dayOfMonth);

    }
    
    //add style to selected date 
    function addListStyle(e) {
        $('.date-list .list-group-item').each(function () {
            $(this).removeClass('active-date');

            if (this == e.currentTarget) {
                $(this).addClass('active-date');
                let day = $(this).attr("data-day");
                let dayOfMonth = $(this).attr("data-day-of-month");
                let month = $(this).attr("data-month");
                localStorage.setItem("day", day);
                localStorage.setItem("dayOfMonth", dayOfMonth);
                localStorage.setItem("month", month);
                //update text when date change
                showDate();

                //update checkout date option
                $('#deliveryDate option').each(function() {
                    if($(this).val() == `${day} , ${month} ${dayOfMonth}`) {
                        $(this).prop("selected", true);
                    }
                });
            
            }
        });
    }


    //show date on page 

    function showDate() {
        let dateText = "First Delivery Date: " + localStorage.getItem("day") + ", " + localStorage.getItem("month") + " " + localStorage.getItem("dayOfMonth");
        $(".show-date").text(dateText);
        $(".delivery-date strong").text(localStorage.getItem("day") + ", " + localStorage.getItem("month") + " " + localStorage.getItem("dayOfMonth"));

    }

     /* menu section functions*/
    //get menu data
    $.get("menu.json", function (data, status) {
        if (status == "success") {

            const menuItems = data;
            for (let i = 0; i < menuItems.length; i++) {
                let id = menuItems[i].id;
                let name = menuItems[i].name;
                let additionalItem = menuItems[i].additionalItem;
                let gluten = menuItems[i].gluten;
                let cals = menuItems[i].cals;
                let carbs = menuItems[i].carbs;
                let protein = menuItems[i].protein;
                let imageUrl = menuItems[i].url;
                let price = menuItems[i].price;
                let tag = menuItems[i].tag;

                displayMenu(id, name, additionalItem, gluten, cals, carbs, protein, imageUrl, price,tag);
            }

        }
    });

    //display menu items
    function displayMenu(id, name, additionalItem, gluten, cals, carbs, protein, imageUrl, price,tag) {

        let temp = $("template")[1];
        let div = temp.content.querySelector("div");
        let menu = document.importNode(div, true);
        $(menu).children(".menuItem").attr("data-id", id);
        $(menu).find(".menu-img").attr({
            "src": imageUrl,
            "alt": name
        });
        $(menu).find(".menuTitle").text(name);
        $(menu).find(".extra").text(additionalItem);
        $(menu).find(".glutenValue").text(gluten);
        $(menu).find(".calValue").text(cals);
        $(menu).find(".crbsValue").text(carbs);
        $(menu).find(".protienValue").text(protein);
        if(tag == "popular"){
            $(menu).children(".menuItem").addClass("popular");
        }

        //onclick add to the cart this item
        $(menu).find(".addTocartBtn").click((e) => {
            addToCart(id, name, additionalItem, imageUrl, price,tag);
        });

        //append to the menu grid
        $(".menu-grid .row").append(menu);

    }

    //add to cart function
    function addToCart(id, name, additionalItem, image, price,tag) {

        //icrement item count
        itemCount++;
        totalCost += Number(price);

        //item to add to cart
        let item = {
            id: id,
            name: name,
            additionalItem: additionalItem,
            imageUrl: image,
            price: price,
            tag:tag,
            count: 1
        };
        //check if item exit 
        let check = isExist(item.id);
        if (check == -1) {
            cart.push(item);
        } else {
            cart[check].count += 1;
        }

        //get template
        let temp = $("template")[2];
        let div = temp.content.querySelector("div");
        let cartItem = document.importNode(div, true);
        $(cartItem).find(".cart-item").attr("data-id", id);
        $(cartItem).find(".cart-item-img img").attr(
            {
                "src": image,
                "alt": name
            });
        $(cartItem).find(".name").text(name);
        if(tag=="popular"){
            $(cartItem).find(".cart-item").addClass("popular");
        }


        //append cart item
        $(".cart-item-section").append(cartItem);

        //plus btn
        $(cartItem).find(".fa-plus").click(() => {
            addToCart(id, name, additionalItem, image, price,tag)
        });
        //remove item
        $(cartItem).find(".fa-minus").click(function () {
            removeItem(this, id, price);

        });


        //add cart summary
         addCartSummary(cartSummary);
        //next buttom check
         cartButtonCkeck();

        //update cart footer
        updateCartFooter();

        //ShowCheckoutMeals
         showCheckoutMeals();



    }

    //clear cart function
    $(".cart .clear").click((e) => {
        //   $(e.target).parent().nextAll().remove();
        $(".cart-item-section").empty();
        itemCount = 0;
        totalCost = 0;
        cart = [];
        $(".cart-summary-div").remove();
        cartButtonCkeck();
        //update cart footer
        updateCartFooter();

        // showCheckoutMeals
        showCheckoutMeals();
    })


    //remove item  from cart function 
    function removeItem(itemToRemove, id, price) {
        itemCount--;
        totalCost -= Number(price);
        $(itemToRemove).parents(".cart-item-div").remove();
        let index = isExist(id);
        if (cart[index].count > 1) {
            cart[index].count--;
        } else {
            cart.splice(index, 1);
        }

        //update cart summary
        updateCartSummary();

        //cart next button check
        cartButtonCkeck();

        //update cart footer
        updateCartFooter();

        //remover cart summary section if 0 item in the cart
        if (itemCount === 0) { $(".cart-summary-div").remove(); }
        // showCheckoutMeals
        showCheckoutMeals();


    }

        //function check if the item is already in the cart
    //if it is then return the index of the item else return -1
    function isExist(id) {
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].id == id) {
                return i;
            }
        }
        return -1;
    }


    //next button of cart check function 
    //it will wnable cart button if the no of cart item are equal to the no in meal plan 
    function cartButtonCkeck() {
        if (itemCount === Number(localStorage.getItem("mealPlan"))) {
            $(".cart-footer .next").removeAttr('disabled');
        } else {
            $(".cart-footer .next").attr("disabled", true);
        }

    }

    //add cart summary function
    function addCartSummary(cartSummary) {
        $(cartSummary).find(".total-item-count").text(itemCount);
        $(cartSummary).find(".total").text(totalCost);
        $(cartSummary).find(".total-amount").text(totalCost);
        $(".cart-summary-section").append(cartSummary);
    }

    //update cart summary function
    function updateCartSummary() {

        $(".cart-summary-section").find(".total-item-count").text(itemCount);
        $(".cart-summary-section").find(".total").text(totalCost);
        $(".cart-summary-section").find(".total-amount").text(totalCost);
    }

    //cart footer update function 
    function updateCartFooter() {
        let mealPlan = Number(localStorage.getItem("mealPlan"));
        let message = "";
        $(".cart-footer .amount").text(totalCost);
        $(".cart-footer .itemcount").text(itemCount);
        if (itemCount === mealPlan) {
            $(".cart-footer .message").text("Ready to go !");
        }
        else if (itemCount < mealPlan) {
            message = "Please add " + (mealPlan - itemCount) + " more meal "
            $(".cart-footer .message").text(message);
        } else {
            message = "Please Remove " + (itemCount - mealPlan) + " more meal "
            $(".cart-footer .message").text(message);
        }

    }
     /* checkout section functions*/

    //    function to generate checkout date options
   function  addCheeckoutOptions(day,month,dayOfMonth){      
      let option= $("<option>").val(`${days[day]} , ${months[month]} ${dayOfMonth}`).text(` ${days[day]} , ${months[month]} ${dayOfMonth}`);
      $(option).attr({
        "data-day": days[day],
        "data-day-of-month": dayOfMonth,
        "data-month": months[month]
    });
       $("#deliveryDate").append(option);

       $("#deliveryDate").change(function(){
        let day = $(this).find(':selected').attr("data-day");
        let dayOfMonth = $(this).find(':selected').attr("data-day-of-month");
        let month = $(this).find(':selected').attr("data-month");
        localStorage.setItem("day", day);
        localStorage.setItem("dayOfMonth", dayOfMonth);
        localStorage.setItem("month", month);
       })
   }

    //checkout meals 
    function showCheckoutMeals(){
        $(".checkout-meal-section").empty();
        for(let j=0 ; j<cart.length; j++){
            let temp = $("template")[4];
            let div = temp.content.querySelector("div");
            let checkoutMeal = document.importNode(div, true);
        $(checkoutMeal).find(".count").text(cart[j].count);
        $(checkoutMeal).find(".checkout-meal-img img").attr(
            {
                "src": cart[j].imageUrl,
                "alt": cart[j].name
            });
        $(checkoutMeal).find(".name").text(cart[j].name);
        $(checkoutMeal).find(".addtionInfo").text(cart[j].additionalItem);
        if(cart[j].tag == "popular"){
            $(checkoutMeal).addClass("popular");
        }
        $(".checkout-meal-section").append(checkoutMeal);
        }
    }

    //show tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
     var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
     return new bootstrap.Tooltip(tooltipTriggerEl);
     });

//show cart slider for mobiles

    $(".slideUpCartBtn").click(function(){
        if($(window).width() < 576) {
    $(".cart-top").toggleClass("toogle-show");
     }
});
$(".cart-icon-div").click(function(){
    if($(window).width() < 576) {
    $(".cart-top").toggleClass("toogle-show");
    }
});
});
