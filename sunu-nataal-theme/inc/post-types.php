<?php
/**
 * Register Custom Post Types and Taxonomies
 *
 * @package Sunu_Nataal
 */

function sunu_nataal_register_cpts() {

    // 1. Randonnées (Walks)
    register_post_type( 'randonnee', array(
        'labels' => array(
            'name' => __( 'Randonnées', 'sunu-nataal' ),
            'singular_name' => __( 'Randonnée', 'sunu-nataal' ),
            'add_new' => __( 'Ajouter une randonnée', 'sunu-nataal' ),
            'add_new_item' => __( 'Ajouter une nouvelle randonnée', 'sunu-nataal' ),
            'edit_item' => __( 'Modifier la randonnée', 'sunu-nataal' ),
            'new_item' => __( 'Nouvelle randonnée', 'sunu-nataal' ),
            'view_item' => __( 'Voir la randonnée', 'sunu-nataal' ),
            'search_items' => __( 'Rechercher des randonnées', 'sunu-nataal' ),
            'not_found' => __( 'Aucune randonnée trouvée', 'sunu-nataal' ),
            'not_found_in_trash' => __( 'Aucune randonnée trouvée dans la corbeille', 'sunu-nataal' ),
        ),
        'public' => true,
        'has_archive' => true,
        'menu_icon' => 'dashicons-location-alt',
        'supports' => array( 'title', 'editor', 'thumbnail', 'excerpt', 'custom-fields' ),
        'show_in_rest' => true, // Gutenberg support
        'rewrite' => array( 'slug' => 'randonnees' ),
    ) );

    // Taxonomy: Niveau (Level) for Randonnées
    register_taxonomy( 'niveau', 'randonnee', array(
        'labels' => array(
            'name' => __( 'Niveaux', 'sunu-nataal' ),
            'singular_name' => __( 'Niveau', 'sunu-nataal' ),
        ),
        'hierarchical' => true,
        'show_in_rest' => true,
    ) );


    // 2. Événements (Events)
    register_post_type( 'evenement', array(
        'labels' => array(
            'name' => __( 'Événements', 'sunu-nataal' ),
            'singular_name' => __( 'Événement', 'sunu-nataal' ),
            'add_new_item' => __( 'Ajouter un nouvel événement', 'sunu-nataal' ),
        ),
        'public' => true,
        'has_archive' => true,
        'menu_icon' => 'dashicons-calendar-alt',
        'supports' => array( 'title', 'editor', 'thumbnail', 'excerpt', 'custom-fields' ),
        'show_in_rest' => true,
        'rewrite' => array( 'slug' => 'evenements' ),
    ) );

    // Taxonomy: Type d'événement
    register_taxonomy( 'type_evenement', 'evenement', array(
        'labels' => array(
            'name' => __( 'Types d\'événement', 'sunu-nataal' ),
            'singular_name' => __( 'Type d\'événement', 'sunu-nataal' ),
        ),
        'hierarchical' => true,
        'show_in_rest' => true,
    ) );


    // 3. Galeries (Galleries)
    register_post_type( 'galerie', array(
        'labels' => array(
            'name' => __( 'Galeries', 'sunu-nataal' ),
            'singular_name' => __( 'Galerie', 'sunu-nataal' ),
            'add_new_item' => __( 'Ajouter une nouvelle galerie', 'sunu-nataal' ),
        ),
        'public' => true,
        'has_archive' => true,
        'menu_icon' => 'dashicons-images-alt2',
        'supports' => array( 'title', 'editor', 'thumbnail', 'excerpt', 'custom-fields' ),
        'show_in_rest' => true,
        'rewrite' => array( 'slug' => 'galeries' ),
    ) );


    // 4. Photographes (Photographers)
    register_post_type( 'photographe', array(
        'labels' => array(
            'name' => __( 'Photographes', 'sunu-nataal' ),
            'singular_name' => __( 'Photographe', 'sunu-nataal' ),
            'add_new_item' => __( 'Ajouter un photographe', 'sunu-nataal' ),
        ),
        'public' => true,
        'has_archive' => true,
        'menu_icon' => 'dashicons-camera',
        'supports' => array( 'title', 'editor', 'thumbnail', 'excerpt', 'custom-fields' ),
        'show_in_rest' => true,
        'rewrite' => array( 'slug' => 'photographes' ),
    ) );


    // 5. Banque d'Images (Image Bank)
    register_post_type( 'image_bank', array(
        'labels' => array(
            'name' => __( 'Banque d\'Images', 'sunu-nataal' ),
            'singular_name' => __( 'Image', 'sunu-nataal' ),
            'add_new_item' => __( 'Ajouter une image', 'sunu-nataal' ),
        ),
        'public' => true,
        'has_archive' => true,
        'menu_icon' => 'dashicons-format-gallery',
        'supports' => array( 'title', 'editor', 'thumbnail', 'custom-fields' ),
        'show_in_rest' => true,
        'rewrite' => array( 'slug' => 'banque-images' ),
    ) );

    // Taxonomy: Catégorie Image
    register_taxonomy( 'categorie_image', 'image_bank', array(
        'labels' => array(
            'name' => __( 'Catégories', 'sunu-nataal' ),
            'singular_name' => __( 'Catégorie', 'sunu-nataal' ),
        ),
        'hierarchical' => true,
        'show_in_rest' => true,
    ) );

}
add_action( 'init', 'sunu_nataal_register_cpts' );
