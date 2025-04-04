describe('Dado que el usuario accede a la vista inicial', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080');
  });

  it('Deberá mostrar el título de la aplicación y texto de instrucciones', () => {
    cy.get('img.logo').should('exist');
    cy.contains('h2', '¿Eres el mejor maestro pokemon del mundo?').should('exist');
    cy.contains('h3', 'Memoriza la mayor cantidad de Pokemons y demuestralo!!').should('exist');
    cy.contains('h1', 'Equipo elegido para esta ronda:').should('exist');
  });

  it('Deberá mostrar un conjunto inicial de 6 Pokémon', () => {
    cy.get('.button-container img', { timeout: 10000 }).should('have.length', 6);
  });

  it('Deberá existir el botón de jugar', () => {
    cy.get('.start-button').should('exist');
  });
});

describe('Dado que el usuario hace click al botón start y se inicia la secuencia', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080');
  });

  it('Deberá de renderizar la secuencia correctamente', () => {
    cy.intercept('POST', '**/enviarSecuencia').as('enviarSecuencia');

    cy.get('.start-button').should('exist');
    cy.get('.start-button', {timeout: 10000}).click();

    cy.contains('h1', 'Secuencia a memorizar:').should('exist')

    cy.contains('h1', 'Secuencia a memorizar:')
      .parent()
      .find('img')
      .should('have.length.greaterThan', 0)
  });

  it('Deberá de reemplazar la secuencia por Ditto después de 5 segundos', () => {
    cy.intercept('POST', '**/enviarSecuencia').as('enviarSecuencia');

    cy.get('.start-button').should('exist');
    cy.get('.start-button', {timeout: 10000}).click();

    cy.contains('h1', 'Secuencia a memorizar:').should('exist');

    cy.wait(5000)

    cy.contains('h1', 'Secuencia a memorizar:')
      .parent()
      .find('img')
      .should('have.length.greaterThan', 0)
      .each(($img) => {
        expect($img.attr('src')).to.eq('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/132.png');
    }); 
  });
});

describe('Dado que el usuario crea y envia una secuencia', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080/');
    cy.intercept('POST', '**/enviarSecuencia').as('enviarSecuencia');
    cy.get('.start-button', { timeout: 10000 }).click();
    cy.contains('h1', 'Secuencia a memorizar:').should('exist');
    cy.wait(5000);
  });

  it('Deberá añadir un Pokémon a la secuencia al hacer click', () => {
    cy.get('.button-container .image-button').first().click();

    cy.contains('h1', 'Secuencia a enviar:')
      .parent()
      .find('img')
      .should('have.length', 1);
  });

  it('Deberá remover un Pokémon de la secuencia al hacer click en éste', () => {
    cy.get('.button-container img').first().click();

    cy.contains('h1', 'Secuencia a enviar:')
      .parent()
      .find('img')
      .should('have.length', 1)
      .click();

    cy.contains('h1', 'Secuencia a enviar:')
      .parent()
      .find('img')
      .should('have.length', 0);
  });

  it('Deberá mostrar el botón de enviar secuencia solo cuando la secuencia esté completa', () => {
    cy.contains('h1', 'Secuencia a memorizar:')
      .parent()
      .find('img')
      .then(($secuencia) => {
        const cantidad = $secuencia.length;
  
        for (let i = 0; i < cantidad; i++) {
          cy.get('.button-container .image-button').eq(i).click();
        }
  
        cy.get('.play-button').should('exist');
      });
  });

  it("Deberá de enviar la secuencia completa al hacer click en el botón de enviar secuencia", () => {
    cy.intercept("POST", "**/enviarSecuencia").as("envioFinal");

    cy.contains("h1", "Secuencia a memorizar:")
      .parent()
      .find("img")
      .then(($secuencia) => {
        const cantidad = $secuencia.length;

        cy.wait(5000);

        for (let i = 0; i < cantidad; i++) {
          cy.get(".button-container .image-button").eq(i).click();
        }

        cy.get(".play-button").click();

        cy.wait("@envioFinal").then((interception) => {
          const enviados = interception.request.body.pokemons;
          expect(enviados).to.have.length(cantidad);
        });
      });
  });  
});

describe('Dado que se finaliza el juego', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8080');
    cy.intercept('POST', '**/enviarSecuencia').as('enviarSecuencia');
    cy.get('.start-button', { timeout: 10000 }).should('exist').click();

    cy.wait('@enviarSecuencia').then((interception) => {
      const secuencia = interception.response.body.pokemonSequence;
      cy.wrap(secuencia).as('secuenciaActual');
      cy.wait(5000);
    });
  });

  it('Debe mostrar el puntaje cuando el juego termina', function () {
    cy.get('@secuenciaActual').then((secuencia) => {
      cy.get('.button-container img').each(($img, index) => {
        if (!secuencia.some(pokemon => pokemon.imagenUrl === $img.attr('src'))) {
          cy.wrap($img).click();
        }
      });

      cy.get('.play-button').click();

      cy.wait('@enviarSecuencia').then((interception) => {
        expect(interception.response.body.resultado).to.equal('TERMINADO');

        cy.contains('h1','GAME OVER').should('exist');
        cy.contains('h2','Puntaje: 0');
      });
    });
  });
});