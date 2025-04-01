<template>
  <div id="app">
    <img src="https://upload.wikimedia.org/wikipedia/commons/9/98/International_Pok%C3%A9mon_logo.svg" alt="Pokémon" class="logo" style="width: 600px; height: auto;">
    <h2 v-if="!juegoIniciado">¿Eres el mejor maestro pokemon del mundo?</h2>
    <h3 v-if="!juegoIniciado">Memoriza la mayor cantidad de Pokemons y demuestralo!!</h3>

    <div  v-if="!juegoFinalizado">
      <h1 v-if="!juegoIniciado">Equipo elegido para esta ronda:</h1>
      <h1 v-else>Instrucciones:</h1>
    </div>

    <p v-if="juegoIniciado && !juegoFinalizado">Para enviar la secuencia de Pokemons da click en el Pokemon deseado, una vez que termines tu secuencia enviala dando click en la Pokebola</p>
    <p v-if="juegoIniciado && !juegoFinalizado">Si te equivocas no pasa nada, solo da click en el pokemon que quieras remover y este será eliminado de la secuencia</p>


    <div  v-if="!juegoFinalizado">
      <div v-if="equipoPokemon.length===0">
        <h4>Cargando equipo Pokemon...</h4>
      </div>
      <div class="button-container" v-else>
        <ImageButton
            v-for="(objectInfo) in equipoPokemon"
            :key="objectInfo.identificador + 'IT'"
            @buttonClick="agregarPokemon(objectInfo)"
            :imageSrc="objectInfo.imagenUrl"
        />
      </div>
    </div>


    <br v-if="!juegoIniciado">
    <br v-if="!juegoIniciado">
    <button class="start-button"
            v-if="equipoPokemon.length!==0 && !juegoIniciado"
            v-on:click="iniciarJuego"
    ></button>

    <div v-if="juegoIniciado">
      <div v-show="secuenciaAMemorizar.length !== secuenciaActual.length">
        <h1>Secuencia a memorizar:</h1>
        <img v-for="(objectInfo, index) in secuenciaAMemorizar"
             :key="objectInfo.identificador + 'SM' + index"
             :src="objectInfo.imagenUrl"
             style="width: 100px; height: auto;"
        />
      </div>

      <div v-if="!juegoFinalizado">
        <h1>Secuencia a enviar:</h1>
        <img v-for="(objectInfo, index) in secuenciaAMostrar"
             v-on:click="removerPokemon(index)"
             :key="index"
             :src="objectInfo.imagenUrl"
             style="width: 100px; height: auto;"
        />
        <br>
        <button class="play-button"
                v-show="secuenciaAMemorizar.length === secuenciaActual.length"
                v-on:click="envioSecuencia"
        ></button>
      </div>
      <div v-else>
        <h1>GAME OVER</h1>
        <h2>Puntaje: {{score}}</h2>
      </div>

    </div>
  </div>
</template>

<script>

import ImageButton from './components/ImageButton.vue';
import axios from 'axios';

export default {
  name: 'App',
  data(){
    return {
      idJuego: null,
      equipoPokemon: [],
      juegoIniciado: false,
      secuenciaActual: [],
      secuenciaAMostrar: [],
      secuenciaAMemorizar: [],
      juegoFinalizado: false,
      score: 0,
      permitirIngresarSecuencia: false

    }
  },
  components: {
    ImageButton
  },
  methods: {
    async removerPokemon(index){
      this.secuenciaAMostrar.splice(index, 1);
      this.secuenciaActual.splice(index, 1);
    },
    async agregarPokemon(pokemon){
      if ((this.secuenciaActual.length < this.secuenciaAMemorizar.length) && this.juegoIniciado && this.permitirIngresarSecuencia){
        this.secuenciaAMostrar.push(pokemon);
        this.secuenciaActual.push(pokemon.identificador);
      }
    },
    async envioSecuencia(){
      this.permitirIngresarSecuencia = false;
      const response = await axios.post('https://memoriapokemonback.onrender.com/enviarSecuencia', {
        idJuego: this.idJuego,
        pokemons: this.secuenciaActual
      });

      if (response.data.resultado === 'TERMINADO') {
        this.juegoFinalizado = true;
        this.score = response.data.score
      } else {
        this.secuenciaAMostrar = [];
        this.secuenciaActual = [];
        this.secuenciaAMemorizar = response.data.pokemonSequence;

        setTimeout(() => {
          this.reemplazarSecuenciaMaquina();
        }, 5000)
      }
    },
    async obtenerEquipoInicial (){
      const response = await axios.get('https://memoriapokemonback.onrender.com/crearJuego');

      this.equipoPokemon = response.data.equipoInicial;
      this.idJuego = response.data.idJuego;
    },
    async iniciarJuego(){
      await this.envioSecuencia();
      this.juegoIniciado = true;
    },
    reemplazarSecuenciaMaquina(){
      const secuenciaDito = []
      for (let i = 0; i < this.secuenciaAMemorizar.length; i++) {
        secuenciaDito.push(
            {
              "identificador": 132,
              "nombre": "ditto",
              "imagenUrl": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png"
            },
        )
      }

      this.secuenciaAMemorizar = secuenciaDito;
      this.permitirIngresarSecuencia = true;
    }
  },
  mounted() {

  },
  created() {
    this.obtenerEquipoInicial();
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.button-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
}

.start-button {
  width: 150px; /* Ajusta el tamaño según sea necesario */
  height: 50px; /* Ajusta el tamaño según sea necesario */
  background-image: url('https://static.vecteezy.com/system/resources/thumbnails/017/522/394/small/button-for-8-bit-games-start-beginning-vector.jpg');
  background-size: cover;
  background-position: center;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
}

.play-button {
  width: 150px; /* Ajusta el tamaño según sea necesario */
  height: 150px; /* Ajusta el tamaño según sea necesario */
  background-image: url('https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/e69b48c0-de96-496f-b849-5f7dd6287b87/d5hkwnr-a4bfd508-9fec-4cdf-a9ab-8b4f13e8ad22.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2U2OWI0OGMwLWRlOTYtNDk2Zi1iODQ5LTVmN2RkNjI4N2I4N1wvZDVoa3duci1hNGJmZDUwOC05ZmVjLTRjZGYtYTlhYi04YjRmMTNlOGFkMjIucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0._cKS7j2fZedTid0G_YVD1eswwHSX7CNs3vHCyQTzFyA');
  background-size: cover;
  background-position: center;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
}

.play-button:hover {
  transform: scale(1.1);
}



.start-button:hover {
  transform: scale(1.1);
}
</style>
