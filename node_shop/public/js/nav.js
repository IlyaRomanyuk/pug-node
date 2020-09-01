const closeButton = document.querySelector('.nav-btn-close');
const openMenu = document.querySelector('.btn-menu');

closeButton.addEventListener('click', function() {
    document.querySelector('.nav-list').style.left = '-300px';
})

openMenu.addEventListener('click', function() {
    document.querySelector('.nav-list').style.left = '0';
})

function getCategoriesMenu() {
    let promiseCategory = fetch('/get-categories', {
        method: 'GET'
    })

    promiseCategory.then(function(result) {
        if(result.status == 200) {
            return result.text()
        } 
    }).then(function(result) {
        refactorOnHtmlList(JSON.parse(result));
    })
}

function refactorOnHtmlList(body) {
    let resultString = "<ul class='category-list'><li><a href='/'>Main</a></li>";

    for(let i = 0; i < body.length; i++) {
        resultString += `<li><a href='/cat?id=${body[i]['id']}'>${body[i]['category']}</a></li>`
    }
    resultString += "</ul>"

    let element = document.querySelector('.category-list');
    element.innerHTML = resultString;
}

getCategoriesMenu();