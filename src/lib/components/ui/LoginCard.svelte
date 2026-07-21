<script>
    import { supabase } from '$lib/supabaseClient';

    let username = $state('');
	let email = $state('');
	let password = $state('');

    let showSignUp = $state(true);

    function toggleMode(){
        showSignUp = !showSignUp;
    }

    async function signUp(){
        if (!username || !email || !password) {
            alert("Completa todos los campos.");
            return;
        }

        const {data, error } = await supabase.auth.signUp({
            email,
            password
        })

        if (error) {
            console.log('Error al crear un usuario:', error)
            alert('Error al crear un usuario: ' + error.message);
            return;
        }

        const user= data.user;
        if (!user) return;

        const { error: ProfileError } = await supabase.from('profiles').insert({
            id: user.id,
            username
        })

        if (ProfileError){
            console.log('Error creando el perfil', ProfileError);
            alert('Error creando el perfil: ' + ProfileError.message);
            return;
        }

        else {
            console.log('Usuario creado exitosamente:', user);
            alert('Usuario creado exitosamente.');
        }

        console.log(data.session);

    }

    async function signIn(){
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        })

        if (error) {
            console.log('Error al iniciar sesión:', error)
            alert('Error al iniciar sesión: ' + error.message);
            return;
        }

        else {
            console.log('Inicio de sesión exitoso');
            alert('Inicio de sesión exitoso.');
        }
    }
</script>

<div>
    <h1 class="title"> {showSignUp ? 'Iniciar sesión' : 'Registrarse'}</h1>

    {#if showSignUp}
        <div class="main-block">
            <input bind:value={email} type="email" placeholder="Email" />
            <input bind:value={password} type="password" placeholder="Password" />

            <button class="main-button" onclick={signIn}>
                <p>Iniciar sesión</p>
            </button>

            <button class="link-button" onclick={toggleMode}>
                ¿No tienes una cuenta? <span>Regístrate</span>
            </button>
        </div>
    

    {:else}
        <div class="main-block">
            <input bind:value={email} type="email" placeholder="Email" />
            <input bind:value={password} type="password" placeholder="Password" />
            <input bind:value={username} type="text" placeholder="Nombre de usuario" />

            <button class="main-button" onclick={signUp}>
                <p>Crear cuenta</p>
            </button>

            <button class="link-button" onclick={toggleMode}>
                ¿Ya tienes una cuenta? <span>Inicia sesión</span>
            </button>
        </div>
    {/if}

</div>

<style>
.main-block {
    width: 100%;
    max-width: 420px;
    margin: 4rem auto;
    padding: 2rem;

    display: flex;
    flex-direction: column;
    gap: 1rem;

    background-color: #201C19;
    border: 3px solid #342E2B;
    border-radius: 20px;
}

.title {
    text-align: center;
    font-size: 1.8rem;
    font-weight: bold;
    color: white;
}

.main-block input {
    padding: 0.9rem 1rem;

    background-color: #352F2C;
    color: white;

    border: 2px solid transparent;
    border-radius: 12px;

    font-size: 1rem;

    transition: border-color .2s ease,
                background-color .2s ease;
}

.main-block input::placeholder {
    color: #8B817B;
}

.main-block input:focus {
    outline: none;
    border-color: #F28C0F;
    background-color: #403936;
}

.main-button {
    margin-top: .5rem;

    padding: 1rem;

    background-color: #F28C0F;
    color: white;

    border: none;
    border-radius: 12px;

    font-size: 1rem;
    font-weight: bold;

    cursor: pointer;

    transition:
        transform .18s ease,
        background-color .18s ease,
        box-shadow .18s ease;
}

@media (hover: hover) {
    .main-button:hover {
        transform: translateY(-3px);
        background-color: #ff9d22;
        box-shadow: 0 8px 20px rgba(242, 140, 15, .25);
    }
}

.main-button:active {
    transform: scale(.97);
}

.main-button p {
    margin: 0;
}

.link-button {
    background: none;
    border: none;
    color: #d0d0d0;
    cursor: pointer;
    font-size: 0.95rem;
    padding: 0;
    margin-top: 0.5rem;
    text-align: center;
}

.link-button span {
    text-decoration: underline;
    font-weight: 600;
    color: white;
}

.link-button:hover span {
    color: #F28C0F;
}
</style>