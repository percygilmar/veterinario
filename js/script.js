document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const loginModule = document.getElementById('loginModule');
    const appointmentModule = document.getElementById('appointmentModule');
    const mainNavbar = document.getElementById('mainNavbar');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const appointmentForm = document.getElementById('appointmentForm');
    const forgotPasswordLink = document.getElementById('forgotPassword');
    const recoveryModal = new bootstrap.Modal(document.getElementById('recoveryModal'));
    const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    const navLogout = document.getElementById('navLogout');
    
    // Expresiones regulares para validación
    const usernameRegex = /^[a-zA-Z0-9]{4,20}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&+=!])(?=.{8,}).*$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{10,15}$/;
    
    // Toggle para mostrar/ocultar contraseña
    document.querySelectorAll('.password-toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.closest('.input-group').querySelector('input');
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });
    
    // Validación en tiempo real para registro
    document.getElementById('registerUsername').addEventListener('input', function() {
        this.classList.toggle('is-invalid', !usernameRegex.test(this.value));
    });
    
    document.getElementById('registerEmail').addEventListener('input', function() {
        this.classList.toggle('is-invalid', !emailRegex.test(this.value));
    });
    
    document.getElementById('registerPassword').addEventListener('input', function() {
        const isValid = passwordRegex.test(this.value);
        this.classList.toggle('is-invalid', !isValid);
        
        // Validar confirmación de contraseña si hay valor
        const confirmPassword = document.getElementById('confirmPassword');
        if (confirmPassword.value) {
            confirmPassword.classList.toggle('is-invalid', confirmPassword.value !== this.value);
        }
    });
    
    document.getElementById('confirmPassword').addEventListener('input', function() {
        const password = document.getElementById('registerPassword').value;
        this.classList.toggle('is-invalid', this.value !== password);
    });
    
    // Formulario de Registro
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validar campos
        let isValid = true;
        
        if (!usernameRegex.test(username)) {
            document.getElementById('registerUsername').classList.add('is-invalid');
            isValid = false;
        }
        
        if (!emailRegex.test(email)) {
            document.getElementById('registerEmail').classList.add('is-invalid');
            isValid = false;
        }
        
        if (!passwordRegex.test(password)) {
            document.getElementById('registerPassword').classList.add('is-invalid');
            isValid = false;
        }
        
        if (password !== confirmPassword) {
            document.getElementById('confirmPassword').classList.add('is-invalid');
            isValid = false;
        }
        
        if (!isValid) {
            return;
        }
        
        // Guardar usuario en localStorage
        const users = JSON.parse(localStorage.getItem('vetUsers')) || [];
        
        // Verificar si el usuario ya existe
        if (users.some(user => user.username === username)) {
            alert('Este nombre de usuario ya está registrado');
            return;
        }
        
        // Agregar nuevo usuario
        users.push({
            username,
            email,
            password // En una aplicación real, NUNCA guardarías contraseñas en texto plano
        });
        
        localStorage.setItem('vetUsers', JSON.stringify(users));
        
        // Mostrar mensaje de éxito y cambiar a pestaña de login
        alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
        const loginTab = new bootstrap.Tab(document.getElementById('login-tab'));
        loginTab.show();
        
        // Limpiar formulario
        this.reset();
    });
    
    // Formulario de Login
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Obtener usuarios registrados
        const users = JSON.parse(localStorage.getItem('vetUsers')) || [];
        
        // Buscar usuario
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            // Login exitoso
            if (rememberMe) {
                localStorage.setItem('vetRememberedUser', username);
            } else {
                localStorage.removeItem('vetRememberedUser');
            }
            
            // Guardar sesión actual
            sessionStorage.setItem('vetLoggedIn', 'true');
            sessionStorage.setItem('vetCurrentUser', username);
            
            // Cambiar a módulo de citas
            loginModule.classList.add('hidden');
            appointmentModule.classList.remove('hidden');
            mainNavbar.classList.remove('hidden');
            
            // Mostrar nombre de usuario en navbar
            document.querySelectorAll('.nav-username').forEach(el => {
                el.textContent = username;
            });
        } else {
            // Login fallido
            alert('Usuario o contraseña incorrectos');
        }
    });
    
    // Recuperación de contraseña
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        recoveryModal.show();
    });
    
    document.getElementById('sendRecovery').addEventListener('click', function() {
        const recoveryInput = document.getElementById('recoveryUsername').value;
        
        if (!recoveryInput) {
            alert('Por favor ingresa tu usuario o correo electrónico');
            return;
        }
        
        // Simular envío de instrucciones
        recoveryModal.hide();
        alert('Se han enviado instrucciones para recuperar tu contraseña al correo asociado a tu cuenta.');
    });
    
    // Formulario de Cita Médica
    appointmentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validar campos
        let isValid = true;
        const inputs = this.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            if (!input.value) {
                input.classList.add('is-invalid');
                isValid = false;
            } else {
                // Validación específica para teléfono
                if (input.id === 'ownerPhone' && !phoneRegex.test(input.value)) {
                    input.classList.add('is-invalid');
                    isValid = false;
                } else {
                    input.classList.remove('is-invalid');
                }
            }
        });
        
        if (!isValid) {
            return;
        }
        
        // Obtener datos del formulario
        const ownerName = document.getElementById('ownerName').value;
        const ownerPhone = document.getElementById('ownerPhone').value;
        const petName = document.getElementById('petName').value;
        const petType = document.getElementById('petType').value;
        const appointmentDate = document.getElementById('appointmentDate').value;
        const symptoms = document.getElementById('symptoms').value;
        
        // Formatear fecha
        const dateObj = new Date(appointmentDate);
        const formattedDate = dateObj.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Generar número de ficha aleatorio
        const ticketNumber = Math.floor(1000 + Math.random() * 9000);
        
        // Guardar cita en localStorage
        const appointments = JSON.parse(localStorage.getItem('vetAppointments')) || [];
        const currentUser = sessionStorage.getItem('vetCurrentUser');
        
        appointments.push({
            id: Date.now(),
            user: currentUser,
            ownerName,
            ownerPhone,
            petName,
            petType,
            appointmentDate,
            symptoms,
            ticketNumber,
            createdAt: new Date().toISOString()
        });
        
        localStorage.setItem('vetAppointments', JSON.stringify(appointments));
        
        // Mostrar confirmación
        document.getElementById('confirmationOwner').textContent = ownerName;
        document.getElementById('confirmationPhone').textContent = ownerPhone;
        document.getElementById('confirmationPet').textContent = `${petName} (${petType})`;
        document.getElementById('confirmationDateTime').textContent = formattedDate;
        document.getElementById('confirmationSymptoms').textContent = symptoms;
        document.getElementById('ticketNumber').textContent = ticketNumber;
        
        // Simular correo de confirmación
        document.getElementById('confirmationEmailContent').innerHTML = `
            <p><strong>Estimado/a ${ownerName}:</strong></p>
            <p>Su cita para <strong>${petName}</strong> ha sido agendada exitosamente.</p>
            <p><strong>Número de ficha:</strong> ${ticketNumber}</p>
            <p><strong>Fecha y hora:</strong> ${formattedDate}</p>
            <p class="mb-0">Por favor presente este número al llegar a la clínica.</p>
        `;
        
        confirmationModal.show();
        
        // Limpiar formulario
        this.reset();
    });
    
    // Botón para imprimir confirmación
    document.getElementById('printConfirmation').addEventListener('click', function() {
        window.print();
    });
    
    // Cerrar sesión
    navLogout.addEventListener('click', function(e) {
        e.preventDefault();
        
        sessionStorage.removeItem('vetLoggedIn');
        sessionStorage.removeItem('vetCurrentUser');
        
        loginModule.classList.remove('hidden');
        appointmentModule.classList.add('hidden');
        mainNavbar.classList.add('hidden');
        
        // Limpiar formulario de login
        loginForm.reset();
    });
    
    // Verificar si hay una sesión activa al cargar la página
    if (sessionStorage.getItem('vetLoggedIn') === 'true') {
        loginModule.classList.add('hidden');
        appointmentModule.classList.remove('hidden');
        mainNavbar.classList.remove('hidden');
        
        // Mostrar nombre de usuario en navbar
        const currentUser = sessionStorage.getItem('vetCurrentUser');
        document.querySelectorAll('.nav-username').forEach(el => {
            el.textContent = currentUser;
        });
    }
    
    // Verificar si hay un usuario recordado
    const rememberedUser = localStorage.getItem('vetRememberedUser');
    if (rememberedUser) {
        document.getElementById('loginUsername').value = rememberedUser;
        document.getElementById('rememberMe').checked = true;
    }
});