document.querySelector('.form').addEventListener('submit', function(event) {
    event.preventDefault();

    let userName = document.querySelector('#userName').value;
    let phoneNumber = document.querySelector('#phone').value;
    let email = document.querySelector('#email').value;
    let address = document.querySelector('#address').value;

    if(!document.querySelector("#rule").checked) {
        Swal.fire({
            title: "Warning",
            text: "Read and acceptthe rule",
            type: "info",
            confirmButtonText: "Ok"
        })
        return false;
    } 

    if(userName == '' || phoneNumber == '' || email == '' || address == '') {
        Swal.fire({
            title: "Warning",
            text: "Fill all inputs",
            type: 'info',
            confirmButtonText: "Ok"
        })
        return false;
    }

    let promise = fetch("/order-data", {
        method: "POST",
        body: JSON.stringify({
            'userName': userName,
            'phoneNumber': phoneNumber,
            'email': email,
            'address': address,
            'cart': JSON.parse(localStorage.getItem('cart'))
        }),
        headers: {
            'Accept' : 'application/json',
            'Content-Type' : 'application/json'
        }
    })

    promise.then((result) => {
        return result.text();
    }).then((data) => {
        if(data == 1) {
            Swal.fire({
                title: "Success",
                text: "Success",
                type: 'info',
                confirmButtonText: "Ok"
            })
        } else {
            Swal.fire({
                title: "Error with mail",
                text: "Error",
                type: 'error',
                confirmButtonText: "Ok"
            })
        }
    })

})
