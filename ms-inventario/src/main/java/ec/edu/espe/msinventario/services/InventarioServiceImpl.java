package ec.edu.espe.msinventario.services;

import ec.edu.espe.msinventario.clients.MedicamentoClienteRest;
import ec.edu.espe.msinventario.models.dto.MedicamentoDTO;
import ec.edu.espe.msinventario.models.entities.Inventario;
import ec.edu.espe.msinventario.repositories.InventarioRepository;
import ec.edu.espe.msinventario.repositories.SucursalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class InventarioServiceImpl implements InventarioService {

    @Autowired
    private InventarioRepository repository;

    @Autowired
    private SucursalRepository sucursalRepository;

    @Autowired
    private MedicamentoClienteRest medicamentoCliente;

    @Override
    public Inventario asignarStock(Inventario inventario) {
        // 1. Validar que el medicamento exista en el otro microservicio
        MedicamentoDTO medicamento = medicamentoCliente.buscarPorId(inventario.getMedicamentoId());

        if (medicamento == null) {
            throw new RuntimeException("Medicamento no encontrado en el catálogo externo");
        }

        // 2. Verificar si ya existe inventario para sumar stock en lugar de duplicar registro
        Optional<Inventario> existente = repository.findBySucursalAndMedicamentoId(
                inventario.getSucursal(), inventario.getMedicamentoId());

        if (existente.isPresent()) {
            Inventario invDB = existente.get();
            invDB.setCantidad(invDB.getCantidad() + inventario.getCantidad());
            return repository.save(invDB);
        }

        return repository.save(inventario);
    }

    // Implementar resto de métodos CRUD (listar, buscarPorId)
    @Override
    public Optional<Inventario> buscarPorId(Long id) {
        return repository.findById(id);
    }

    @Override
    public Optional<Inventario> buscarPorSucursalYMedicamento(Long sucursalId, Long medicamentoId) {
        // Buscamos la entidad sucursal primero
        Optional<ec.edu.espe.msinventario.models.entities.Sucursal> sucursalOpt = sucursalRepository.findById(sucursalId);
        if (sucursalOpt.isEmpty()) {
            return Optional.empty();
        }
        return repository.findBySucursalAndMedicamentoId(sucursalOpt.get(), medicamentoId);
    }

    @Override
    public void descontarStock(Long sucursalId, Long medicamentoId, Integer cantidad) {
        Optional<ec.edu.espe.msinventario.models.entities.Sucursal> sucursalOpt = sucursalRepository.findById(sucursalId);
        if (sucursalOpt.isEmpty()) {
            throw new RuntimeException("Sucursal no encontrada: " + sucursalId);
        }

        Optional<Inventario> inventarioOpt = repository.findBySucursalAndMedicamentoId(sucursalOpt.get(), medicamentoId);
        if (inventarioOpt.isEmpty()) {
            throw new RuntimeException("No hay inventario para este producto en la sucursal indicada");
        }

        Inventario inventario = inventarioOpt.get();

        if (inventario.getCantidad() < cantidad) {
            throw new RuntimeException("Stock insuficiente. Disponible: " + inventario.getCantidad());
        }

        inventario.setCantidad(inventario.getCantidad() - cantidad);
        repository.save(inventario);
    }
}