<script>
    import { Dice1, Dice2, Dice3, Dice4, Dice5 } from '@lucide/svelte'
</script>

<div class="tables">
    <div class="button-container">
        <button class="table-button">
            <Dice4 strokeWidth={2} size={80}/>
            <span>Mesa 4</span>
        </button>

        <button class="table-button">
            <Dice5 strokeWidth={2} size={80}/>
            <span>Mesa 5</span>
        </button>
    </div> 

    <div class="button-container">
        <button class="table-button">
            <Dice2 strokeWidth={2} size={80}/>
            <span>Mesa 2</span>
        </button>

        <button class="table-button">
            <Dice3 strokeWidth={2} size={80}/>
            <span>Mesa 3</span>
        </button>
    </div>

    <div class="button-container">
        <button class="table-button">
            <Dice1 strokeWidth={2} size={80}/>
            <span>Mesa 1</span>
        </button>
    </div>
</div>


<style>

.tables{
    margin: 8rem 1.5rem 0 1.5rem;
}

.button-container{
    display: flex;
    gap: 2rem;
    justify-content: center;
    margin-bottom: 2rem;
}

.table-button{
    padding: 2.5rem 0 2.5rem 0;
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    background-color: #201C19;
    border-radius: 15px;
    font-size: 1.2rem;
    gap: 1rem;
    color: #7d7570;
}
</style>