package ma.smartypark.smartypark_backend.service;

import ma.smartypark.smartypark_backend.dto.espace.EspacePublicRequest;
import ma.smartypark.smartypark_backend.dto.espace.EspacePublicResponse;
import ma.smartypark.smartypark_backend.entity.CategorieEspace;

import java.util.List;

public interface EspacePublicService {

    EspacePublicResponse create(EspacePublicRequest request);

    EspacePublicResponse findById(Long id);

    List<EspacePublicResponse> findAllValidated();

    List<EspacePublicResponse> findAll();

    List<EspacePublicResponse> findByCategorie(CategorieEspace categorie);

    List<EspacePublicResponse> searchByNom(String nom);

    EspacePublicResponse update(Long id, EspacePublicRequest request);

    EspacePublicResponse validate(Long id);

    void delete(Long id);
}