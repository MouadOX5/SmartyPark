package ma.smartypark.smartypark_backend.service.impl;

import lombok.RequiredArgsConstructor;
import ma.smartypark.smartypark_backend.dto.espace.EspacePublicRequest;
import ma.smartypark.smartypark_backend.dto.espace.EspacePublicResponse;
import ma.smartypark.smartypark_backend.entity.CategorieEspace;
import ma.smartypark.smartypark_backend.entity.EspacePublic;
import ma.smartypark.smartypark_backend.mapper.EspacePublicMapper;
import ma.smartypark.smartypark_backend.repository.EspacePublicRepository;
import ma.smartypark.smartypark_backend.service.EspacePublicService;
import ma.smartypark.smartypark_backend.exception.ResourceNotFoundException;
import ma.smartypark.smartypark_backend.service.FileStorageService;
import ma.smartypark.smartypark_backend.service.JournalService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EspacePublicServiceImpl implements EspacePublicService {

    private final EspacePublicRepository espacePublicRepository;
    private final EspacePublicMapper espacePublicMapper;
    private final JournalService journalService;
    private final FileStorageService fileStorageService;

    @Override
    @Transactional
    public EspacePublicResponse create(EspacePublicRequest request, MultipartFile image) {
        EspacePublic espace = espacePublicMapper.toEntity(request);

        // Stockage de l'image si fournie
        if (image != null && !image.isEmpty()) {
            String imagePath = fileStorageService.storeEspaceImage(image);
            espace.setImageUrl(imagePath);
        }

        EspacePublic espaceEnregistre = espacePublicRepository.save(espace);

        journalService.log(
                "CREATION_ESPACE",
                "Création de l'espace public '" + espaceEnregistre.getNom()
                        + "' (ID : " + espaceEnregistre.getId() + ")"
        );

        return espacePublicMapper.toResponse(espaceEnregistre);
    }

    @Override
    public EspacePublicResponse findById(Long id) {
        EspacePublic espace = espacePublicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Espace public introuvable"));
        return espacePublicMapper.toResponse(espace);
    }

    @Override
    public List<EspacePublicResponse> findAllValidated() {
        return espacePublicRepository.findByEstValideTrue().stream()
                .map(espacePublicMapper::toResponse)
                .toList();
    }

    @Override
    public List<EspacePublicResponse> findAll() {
        return espacePublicRepository.findAll().stream()
                .map(espacePublicMapper::toResponse)
                .toList();
    }

    @Override
    public List<EspacePublicResponse> findByCategorie(CategorieEspace categorie) {
        return espacePublicRepository.findByEstValideTrueAndCategorie(categorie).stream()
                .map(espacePublicMapper::toResponse)
                .toList();
    }

    @Override
    public List<EspacePublicResponse> searchByNom(String nom) {
        return espacePublicRepository.findByEstValideTrueAndNomContainingIgnoreCase(nom).stream()
                .map(espacePublicMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public EspacePublicResponse update(Long id, EspacePublicRequest request, MultipartFile image) {
        EspacePublic espace = espacePublicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Espace public introuvable"));

        espace.setNom(request.getNom());
        espace.setDescription(request.getDescription());
        espace.setCategorie(request.getCategorie());
        espace.setAdresse(request.getAdresse());
        espace.setLatitude(request.getLatitude());
        espace.setLongitude(request.getLongitude());

        // Gestion du remplacement d'image
        if (image != null && !image.isEmpty()) {
            // Suppression de l'ancienne image si elle existe
            if (espace.getImageUrl() != null && !espace.getImageUrl().isBlank()) {
                fileStorageService.deleteEspaceImage(espace.getImageUrl());
            }
            String newImagePath = fileStorageService.storeEspaceImage(image);
            espace.setImageUrl(newImagePath);
        }

        EspacePublic espaceModifie = espacePublicRepository.save(espace);

        journalService.log(
                "MODIFICATION_ESPACE",
                "Modification de l'espace public '" + espaceModifie.getNom()
                        + "' (ID : " + espaceModifie.getId() + ")"
        );

        return espacePublicMapper.toResponse(espaceModifie);
    }

    @Override
    @Transactional
    public EspacePublicResponse validate(Long id) {
        EspacePublic espace = espacePublicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Espace public introuvable"));

        espace.setEstValide(true);
        return espacePublicMapper.toResponse(espacePublicRepository.save(espace));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        EspacePublic espace = espacePublicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Espace public introuvable"));

        String nomEspace = espace.getNom();

        // Suppression de l'image associée si elle existe
        if (espace.getImageUrl() != null && !espace.getImageUrl().isBlank()) {
            fileStorageService.deleteEspaceImage(espace.getImageUrl());
        }

        espacePublicRepository.delete(espace);

        journalService.log(
                "SUPPRESSION_ESPACE",
                "Suppression de l'espace public '" + nomEspace
                        + "' (ID : " + id + ")"
        );
    }
}