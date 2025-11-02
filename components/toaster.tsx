import React from 'react'
import { Bounce, ToastContainer } from 'react-toastify'

function toaster() {
    return (
        <ToastContainer
            position="bottom-right"
            autoClose={8000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            transition={Bounce}
        />
    )
}

export default toaster